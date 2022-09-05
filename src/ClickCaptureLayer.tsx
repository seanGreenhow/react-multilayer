import * as React from "react";
import DragHandler from "./DragHandler";
import { layerStyles } from "./Layer";
import Multilayer from "./MultiLayer";

export default class ClickCaptureLayer extends React.Component<{
  wrapper: Multilayer;
  dragHandler: DragHandler;
  nested?: boolean;
}> {
  readonly ref = React.createRef<HTMLDivElement>();

  render() {
    const mousePropagator = this.props.wrapper.getPropagator(MouseEvent);
    const wheelPropagator = this.props.wrapper.getPropagator(WheelEvent);

    return (
      <div
        style={layerStyles}
        ref={this.ref}
        onClick={mousePropagator}
        onDoubleClick={mousePropagator}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onContextMenu={mousePropagator}
        onWheel={wheelPropagator}
        onMouseMove={this.handleMouseMove}
      />
    );
  }

  handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    this.props.wrapper.getPropagator(MouseEvent)(e);
    this.props.wrapper.forEachLayer((layer) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);

      let currentTarget = target;
      let result: Element;
      while (currentTarget) {
        if (
          currentTarget.hasAttribute("draggable") &&
          currentTarget.getAttribute("draggable")
        ) {
          result = currentTarget;
          break;
        }
        currentTarget = currentTarget.parentElement;
      }
      if (result) {
        this.props.dragHandler.dragTarget = result;
        return true;
      }
    });
  };

  handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    this.props.wrapper.getPropagator(MouseEvent)(e);

    if (this.props.dragHandler.dragging) {
      this.props.wrapper.forEachLayer((layer) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const event = new DragEvent("drop", {
          ...e.nativeEvent,
          dataTransfer: this.props.dragHandler.dragDataObject,
        });
        target.dispatchEvent(event);
        if (event.defaultPrevented) return true;
      });
    }

    if (this.props.dragHandler.dragging && !this.props.nested) {
      const event = new DragEvent("dragend", {
        ...e.nativeEvent,
        dataTransfer: this.props.dragHandler.dragDataObject,
      });
      this.props.dragHandler.dragTarget.dispatchEvent(event);

      this.props.dragHandler.dragging = false;
      this.props.dragHandler.dragDataObject = undefined;
      this.props.dragHandler.dragTarget = undefined;
    }
  };

  handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    this.props.wrapper.getPropagator(MouseEvent)(e);

    if (
      this.props.dragHandler.dragTarget &&
      !this.props.dragHandler.dragging &&
      !this.props.nested
    ) {
      this.props.dragHandler.dragDataObject = new DataTransfer();
      const event = new DragEvent("dragstart", {
        ...e.nativeEvent,
        dataTransfer: this.props.dragHandler.dragDataObject,
      });

      this.props.dragHandler.dragTarget.dispatchEvent(event);
      this.props.dragHandler.dragging = true;
    } else if (
      this.props.dragHandler.dragTarget &&
      this.props.dragHandler.dragging &&
      !this.props.nested
    ) {
      const event = new DragEvent("drag", {
        ...e.nativeEvent,
        dataTransfer: this.props.dragHandler.dragDataObject,
      });
      this.props.dragHandler.dragTarget.dispatchEvent(event);
    }

    this.props.wrapper.forEachLayer((layer) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      layer.checkMouseTrigger(target, e);

      if (this.props.dragHandler.dragTarget) {
        layer.checkDragTrigger(
          target,
          e,
          this.props.dragHandler.dragDataObject
        );
      }
      layer.lastPointerTarget = target;
    });
  };
}
