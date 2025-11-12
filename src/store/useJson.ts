import type { JSONPath } from "jsonc-parser";
import { create } from "zustand";
import useGraph from "../features/editor/views/GraphView/stores/useGraph";
import useFile from "./useFile";

interface JsonActions {
  setJson: (json: string) => void;
  getJson: () => string;
  clear: () => void;
  updateNodeValue: (path: JSONPath | undefined, newValue: string) => void;
}

const initialStates = {
  json: "{}",
  loading: true,
};

export type JsonStates = typeof initialStates;

const parseValue = (value: string): unknown => {
  // Try to parse as JSON first to handle null, boolean, number
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch {
    // If JSON parse fails, return as string
    return value;
  }
};

const setValueAtPath = (obj: unknown, path: JSONPath | undefined, value: unknown): unknown => {
  if (!path || path.length === 0) {
    return value;
  }

  const [head, ...tail] = path;
  if (Array.isArray(obj)) {
    const arr = [...(obj as unknown[])];
    arr[head as number] = setValueAtPath(arr[head as number], tail, value);
    return arr;
  } else if (typeof obj === "object" && obj !== null) {
    return {
      ...((obj as Record<string, unknown>) || {}),
      [head]: setValueAtPath((obj as Record<string, unknown>)?.[head as string], tail, value),
    };
  }
  return value;
};

const useJson = create<JsonStates & JsonActions>()((set, get) => ({
  ...initialStates,
  getJson: () => get().json,
  setJson: json => {
    set({ json, loading: false });
    useGraph.getState().setGraph(json);
  },
  clear: () => {
    set({ json: "", loading: false });
    useGraph.getState().clearGraph();
  },
  updateNodeValue: (path, newValue) => {
    const currentJson = get().json;
    try {
      const parsed = JSON.parse(currentJson);
      const parsedValue = parseValue(newValue);
      const updated = setValueAtPath(parsed, path, parsedValue);
      const newJson = JSON.stringify(updated, null, 2);
      get().setJson(newJson);
      // Sync updated JSON to file store so left panel updates immediately
      useFile.getState().setContents({ contents: newJson, hasChanges: false });
    } catch (error) {
      console.error("Failed to update node value:", error);
    }
  },
}));

export default useJson;
