import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ReactFlowProvider } from "@xyflow/react";
import { BlocksFlyout } from "../src/components/blocks-flyout";
import { AnimationBeamScopeControls, AnimationPathBuilder } from "../src/components/animation-options";
import { Toolbar } from "../src/components/toolbar";
import { useFlowStore } from "../src/store/flow-store";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, readLocale, translate, useLocaleStore } from "../src/i18n";

beforeEach(() => useLocaleStore.setState({ locale: DEFAULT_LOCALE }));
afterEach(() => vi.unstubAllGlobals());

describe("interface language", () => {
  test("defaults to Simplified Chinese for new, invalid, or blocked storage", () => {
    expect(readLocale({ getItem: () => null })).toBe("zh-CN");
    expect(readLocale({ getItem: () => "fr" })).toBe("zh-CN");
    expect(readLocale({ getItem: () => { throw new Error("Blocked"); } })).toBe("zh-CN");
    expect(readLocale({ getItem: () => "en" })).toBe("en");
    expect(readLocale({ getItem: () => "zh-CN" })).toBe("zh-CN");
  });

  test("persists the preference, updates HTML language, and preserves project state", () => {
    const saved = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => saved.set(key, value),
    } });
    vi.stubGlobal("document", { documentElement: { lang: "zh-CN" } });
    const project = useFlowStore.getState();
    useLocaleStore.getState().setLocale("en");
    expect(saved.get(LOCALE_STORAGE_KEY)).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(readLocale()).toBe("en");
    expect(useFlowStore.getState()).toBe(project);
    useLocaleStore.getState().setLocale("zh-CN");
    expect(document.documentElement.lang).toBe("zh-CN");
    expect(readLocale()).toBe("zh-CN");
  });

  test("switches even when writing preferences is blocked", () => {
    vi.stubGlobal("window", { get localStorage() { throw new Error("Blocked"); } });
    useLocaleStore.getState().setLocale("en");
    expect(translate("General")).toBe("General");
    useLocaleStore.getState().setLocale("zh-CN");
    expect(translate("General")).toBe("通用");
    expect(translate("Uncatalogued message")).toBe("Uncatalogued message");
    expect(translate("toString")).toBe("toString");
    expect(translate("Delete {label}", { label: "My server" })).toBe("删除 My server");
  });

  test("renders the toolbar and component library in both languages", () => {
    const render = () => renderToStaticMarkup(<ReactFlowProvider>
      <Toolbar /><BlocksFlyout onAdded={() => {}} />
    </ReactFlowProvider>);
    const chinese = render();
    expect(chinese).toContain('aria-label="设置"');
    expect(chinese).toContain('placeholder="搜索…"');
    expect(chinese).toContain("负载均衡器");
    expect(chinese).toContain("负载均衡 Web 应用");
    useLocaleStore.setState({ locale: "en" });
    const english = render();
    expect(english).toContain('aria-label="Settings"');
    expect(english).toContain('placeholder="Search…"');
    expect(english).toContain("Load Balancer");
  });

  test("translates path instructions while preserving editable animation names", () => {
    useFlowStore.getState().beginAnimationPath();
    expect(renderToStaticMarkup(<AnimationPathBuilder />)).toContain("依次点击已连接的组件");
    const markup = renderToStaticMarkup(<AnimationBeamScopeControls
      activeScenarioId="custom" activeBeamKey="beam"
      animationOptions={[{ value: "custom", label: "Animation" }]}
      beamOptions={[{ value: "beam", label: "My beam" }]}
      onAnimationChange={() => {}} onBeamChange={() => {}}
    />);
    expect(markup).toContain(">Animation<");
    expect(markup).toContain(">My beam<");
    expect(markup).toContain('aria-label="动画实例"');
  });
});
