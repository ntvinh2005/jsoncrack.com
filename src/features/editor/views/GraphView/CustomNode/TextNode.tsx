import React from "react";
import styled from "styled-components";
import type { CustomNodeProps } from ".";
import useConfig from "../../../../../store/useConfig";
import useJson from "../../../../../store/useJson";
import { isContentImage } from "../lib/utils/calculateNodeSize";
import { TextRenderer } from "./TextRenderer";
import * as Styled from "./styles";

const StyledTextNodeWrapper = styled.span<{ $isParent: boolean }>`
  display: flex;
  justify-content: ${({ $isParent }) => ($isParent ? "center" : "flex-start")};
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: 0 10px;
`;

const StyledImageWrapper = styled.div`
  padding: 5px;
`;

const StyledImage = styled.img`
  border-radius: 2px;
  object-fit: contain;
  background: ${({ theme }) => theme.BACKGROUND_MODIFIER_ACCENT};
`;

const StyledEditContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  padding: 0 8px;
  box-sizing: border-box;
`;

const StyledEditInput = styled.input`
  flex: 1;
  min-width: 50px;
  padding: 4px 6px;
  font-family: monospace;
  font-size: 12px;
  border: 1px solid ${({ theme }) => theme.NODE_COLORS.NODE_VALUE};
  border-radius: 2px;
  background: ${({ theme }) => theme.BACKGROUND_MODIFIER_ACCENT};
  color: ${({ theme }) => theme.NODE_COLORS.TEXT};
  outline: none;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const StyledButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  background: ${({ theme, $variant }) =>
    $variant === "primary" ? "#3b82f6" : theme.BACKGROUND_MODIFIER_ACCENT};
  color: ${({ theme, $variant }) => ($variant === "primary" ? "white" : theme.NODE_COLORS.TEXT)};
  border: 1px solid
    ${({ theme, $variant }) => ($variant === "primary" ? "transparent" : theme.NODE_COLORS.DIVIDER)};

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.7;
  }
`;

const Node = ({ node, x, y }: CustomNodeProps) => {
  const { text, width, height } = node;
  const imagePreviewEnabled = useConfig(state => state.imagePreviewEnabled);
  const isImage = imagePreviewEnabled && isContentImage(JSON.stringify(text[0].value));
  const value = text[0].value;

  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(String(value));
  const updateNodeValue = useJson(state => state.updateNodeValue);

  const handleEdit = () => {
    setEditValue(String(value));
    setIsEditing(true);
  };

  const handleSave = () => {
    updateNodeValue(node.path, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      handleSave();
    } else if (e.key === "Escape") {
      e.stopPropagation();
      handleCancel();
    }
  };

  if (isImage) {
    return (
      <Styled.StyledForeignObject
        data-id={`node-${node.id}`}
        width={width}
        height={height}
        x={0}
        y={0}
      >
        <StyledImageWrapper>
          <StyledImage src={JSON.stringify(text[0].value)} width="70" height="70" loading="lazy" />
        </StyledImageWrapper>
      </Styled.StyledForeignObject>
    );
  }

  if (isEditing) {
    return (
      <Styled.StyledForeignObject
        data-id={`node-${node.id}`}
        width={width}
        height={height}
        x={0}
        y={0}
      >
        <StyledEditContainer>
          <StyledEditInput
            autoFocus
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
          />
          <StyledButton $variant="primary" onClick={handleSave}>
            Save
          </StyledButton>
          <StyledButton $variant="secondary" onClick={handleCancel}>
            Cancel
          </StyledButton>
        </StyledEditContainer>
      </Styled.StyledForeignObject>
    );
  }

  return (
    <Styled.StyledForeignObject
      data-id={`node-${node.id}`}
      width={width}
      height={height}
      x={0}
      y={0}
    >
      <StyledTextNodeWrapper
        data-x={x}
        data-y={y}
        data-key={JSON.stringify(text)}
        $isParent={false}
      >
        <Styled.StyledKey $value={value} $type={typeof text[0].value}>
          <TextRenderer>{value}</TextRenderer>
        </Styled.StyledKey>
        <StyledButton onClick={handleEdit} $variant="secondary" title="Edit value">
          Edit
        </StyledButton>
      </StyledTextNodeWrapper>
    </Styled.StyledForeignObject>
  );
};

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return prev.node.text === next.node.text && prev.node.width === next.node.width;
}

export const TextNode = React.memo(Node, propsAreEqual);
