import React from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Text, ScrollArea, Flex, CloseButton, Button, Textarea } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import useJson from "../../../store/useJson";
import type { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";

// return object from json removing array and object fields
const normalizeNodeData = (nodeRows: NodeData["text"]) => {
  if (!nodeRows || nodeRows.length === 0) return "{}";
  if (nodeRows.length === 1 && !nodeRows[0].key) return `${nodeRows[0].value}`;

  const obj = {};
  nodeRows?.forEach(row => {
    if (row.type !== "array" && row.type !== "object") {
      if (row.key) obj[row.key] = row.value;
    }
  });
  return JSON.stringify(obj, null, 2);
};

// return json path in the format $["customer"]
const jsonPathToString = (path?: NodeData["path"]) => {
  if (!path || path.length === 0) return "$";
  const segments = path.map(seg => (typeof seg === "number" ? seg : `"${seg}"`));
  return `$[${segments.join("][")}]`;
};

export const NodeModal = ({ opened, onClose }: ModalProps) => {
  const nodeData = useGraph(state => state.selectedNode);
  const updateNodeValue = useJson(state => state.updateNodeValue);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState("");

  React.useEffect(() => {
    if (nodeData) {
      setEditValue(normalizeNodeData(nodeData.text ?? []));
      setIsEditing(false);
    }
  }, [nodeData, opened]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (nodeData?.path) {
      try {
        // Try to parse as JSON first (for objects/arrays)
        const parsed = JSON.parse(editValue);
        updateNodeValue(nodeData.path, JSON.stringify(parsed));
      } catch {
        // If not valid JSON, treat as a simple value
        updateNodeValue(nodeData.path, editValue);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (nodeData) {
      setEditValue(normalizeNodeData(nodeData.text ?? []));
    }
    setIsEditing(false);
  };

  return (
    <Modal size="auto" opened={opened} onClose={onClose} centered withCloseButton={false}>
      <Stack pb="sm" gap="sm">
        <Stack gap="xs">
          <Flex justify="space-between" align="center">
            <Text fz="xs" fw={500}>
              Content
            </Text>
            <Flex gap="xs">
              {!isEditing && (
                <Button variant="light" size="xs" onClick={handleEdit}>
                  Edit
                </Button>
              )}
              <CloseButton onClick={onClose} />
            </Flex>
          </Flex>
          <ScrollArea.Autosize mah={250} maw={600}>
            {isEditing ? (
              <Textarea
                placeholder="Enter content"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                minRows={5}
                styles={{ input: { minWidth: 350, maxWidth: 600, fontFamily: "monospace" } }}
              />
            ) : (
              <CodeHighlight code={editValue} miw={350} maw={600} language="json" withCopyButton />
            )}
          </ScrollArea.Autosize>
          {isEditing && (
            <Flex gap="xs" justify="flex-end">
              <Button variant="default" size="xs" onClick={handleCancel}>
                Cancel
              </Button>
              <Button color="blue" size="xs" onClick={handleSave}>
                Save
              </Button>
            </Flex>
          )}
        </Stack>
        <Text fz="xs" fw={500}>
          JSON Path
        </Text>
        <ScrollArea.Autosize maw={600}>
          <CodeHighlight
            code={jsonPathToString(nodeData?.path)}
            miw={350}
            mah={250}
            language="json"
            copyLabel="Copy to clipboard"
            copiedLabel="Copied to clipboard"
            withCopyButton
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};
