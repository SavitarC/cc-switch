import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { CodexFormFields } from "@/components/providers/forms/CodexFormFields";
import { Form } from "@/components/ui/form";
import type { CodexCatalogModel } from "@/types";

const modelFetchApiMock = vi.hoisted(() => ({
  fetchModelsForConfig: vi.fn(),
  showFetchModelsError: vi.fn(),
}));

vi.mock("@/lib/api/model-fetch", () => ({
  fetchModelsForConfig: modelFetchApiMock.fetchModelsForConfig,
  showFetchModelsError: modelFetchApiMock.showFetchModelsError,
}));

const FormShell = ({ children }: PropsWithChildren) => {
  const form = useForm();

  return <Form {...form}>{children}</Form>;
};

const renderCodexForm = (
  overrides: Partial<Parameters<typeof CodexFormFields>[0]> = {},
) => {
  const catalogModels: CodexCatalogModel[] = [
    {
      model: "deepseek-v4-flash",
      displayName: "DeepSeek V4 Flash",
      contextWindow: 128000,
    },
    {
      model: "kimi-k2",
      displayName: "Kimi K2",
      contextWindow: 64000,
    },
  ];

  const props: Parameters<typeof CodexFormFields>[0] = {
    codexApiKey: "sk-test",
    onApiKeyChange: vi.fn(),
    category: "third_party",
    shouldShowApiKeyLink: false,
    websiteUrl: "",
    shouldShowSpeedTest: true,
    codexBaseUrl: "https://api.example.com/v1",
    onBaseUrlChange: vi.fn(),
    isFullUrl: false,
    onFullUrlChange: vi.fn(),
    isEndpointModalOpen: false,
    onEndpointModalToggle: vi.fn(),
    autoSelect: false,
    onAutoSelectChange: vi.fn(),
    apiFormat: "openai_responses",
    onApiFormatChange: vi.fn(),
    catalogModels,
    onCatalogModelsChange: vi.fn(),
    speedTestEndpoints: [],
    customUserAgent: "",
    onCustomUserAgentChange: vi.fn(),
    localProxyHeadersOverride: "",
    onLocalProxyHeadersOverrideChange: vi.fn(),
    localProxyBodyOverride: "",
    onLocalProxyBodyOverrideChange: vi.fn(),
    ...overrides,
  };

  return {
    onCatalogModelsChange: props.onCatalogModelsChange,
    ...render(
      <FormShell>
        <CodexFormFields {...props} />
      </FormShell>,
    ),
  };
};

describe("CodexFormFields", () => {
  it("updates only the selected catalog row FAST mode", async () => {
    const onCatalogModelsChange = vi.fn();
    renderCodexForm({ onCatalogModelsChange });

    const fastModeSwitches = screen.getAllByRole("switch", {
      name: "FAST mode",
    });

    expect(fastModeSwitches).toHaveLength(2);
    expect(fastModeSwitches[0]).not.toBeChecked();
    expect(fastModeSwitches[1]).not.toBeChecked();

    fireEvent.click(fastModeSwitches[1]);

    await waitFor(() => {
      expect(onCatalogModelsChange).toHaveBeenCalledWith([
        {
          model: "deepseek-v4-flash",
          displayName: "DeepSeek V4 Flash",
          contextWindow: 128000,
        },
        {
          model: "kimi-k2",
          displayName: "Kimi K2",
          contextWindow: 64000,
          fastMode: true,
        },
      ]);
    });
  });
});
