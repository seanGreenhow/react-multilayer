import * as React from "react";

export const layerStyles: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  padding: 0,
  margin: 0,
  width: "100%",
  height: "100%",
  background: "transparent",
};

export default class Layer<Props = {}, State = {}> extends React.Component<
  Props & React.HTMLAttributes<HTMLDivElement>,
  State
> {
  readonly ref = React.createRef<HTMLDivElement>();
  lastPointerTarget: Element;

  render() {
    const { style, children, ...rest } = this.props;

    return (
      <div
        style={Object.assign({}, layerStyles, style ? style : {})}
        ref={this.ref}
        {...rest}
      >
        {children}
      </div>
    );
  }

  checkMouseTrigger(target: Element, e: React.MouseEvent<HTMLDivElement>) {
    this.checkMouseOut(target, e);
    this.checkMouseLeave(target, e);
    this.checkMouseOver(target, e);
    this.checkMouseEnter(target, e);
  }

  private checkMouseEnter(
    target: Element,
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      this.lastPointerTarget !== target &&
      target &&
      !target.contains(this.lastPointerTarget)
    ) {
      const event = new MouseEvent("mouseenter", {
        ...e.nativeEvent,
        bubbles: false,
      });
      target.dispatchEvent(event);
    }
  }

  private checkMouseOver(target: Element, e: React.MouseEvent<HTMLDivElement>) {
    if (target && this.lastPointerTarget !== target) {
      const event = new MouseEvent("mouseover", e.nativeEvent);
      target.dispatchEvent(event);
    }
  }

  private checkMouseLeave(
    target: Element,
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      this.lastPointerTarget !== target &&
      this.lastPointerTarget &&
      !this.lastPointerTarget.contains(target)
    ) {
      const event = new MouseEvent("mouseleave", {
        ...e.nativeEvent,
        bubbles: false,
      });
      this.lastPointerTarget.dispatchEvent(event);
    }
  }

  private checkMouseOut(target: Element, e: React.MouseEvent<HTMLDivElement>) {
    if (this.lastPointerTarget && this.lastPointerTarget !== target) {
      const event = new MouseEvent("mouseout", e.nativeEvent);
      this.lastPointerTarget.dispatchEvent(event);
    }
  }

  checkDragTrigger(
    target: Element,
    e: React.MouseEvent<HTMLDivElement>,
    dataTransfer: DataTransfer
  ) {
    this.checkDragExit(target, e, dataTransfer);
    this.checkDragLeave(target, e, dataTransfer);
    this.checkDragOver(target, e, dataTransfer);
    this.checkDragEnter(target, e, dataTransfer);
  }

  private checkDragEnter(
    target: Element,
    e: React.MouseEvent<HTMLDivElement>,
    dataTransfer: DataTransfer
  ) {
    if (
      this.lastPointerTarget !== target &&
      target &&
      !target.contains(this.lastPointerTarget)
    ) {
      const event = new DragEvent("dragenter", {
        ...e.nativeEvent,
        bubbles: false,
        dataTransfer,
      });
      return target.dispatchEvent(event);
    }
  }

  private checkDragOver(
    target: Element,
    e: React.MouseEvent<HTMLDivElement>,
    dataTransfer: DataTransfer
  ) {
    if (target && this.lastPointerTarget !== target) {
      const event = new DragEvent("dragover", {
        ...e.nativeEvent,
        dataTransfer,
      });
      return target.dispatchEvent(event);
    }
  }

  private checkDragLeave(
    target: Element,
    e: React.MouseEvent<HTMLDivElement>,
    dataTransfer: DataTransfer
  ) {
    if (
      this.lastPointerTarget !== target &&
      this.lastPointerTarget &&
      !this.lastPointerTarget.contains(target)
    ) {
      const event = new DragEvent("dragleave", {
        ...e.nativeEvent,
        bubbles: false,
        dataTransfer,
      });
      return this.lastPointerTarget.dispatchEvent(event);
    }
  }

  private checkDragExit(
    target: Element,
    e: React.MouseEvent<HTMLDivElement>,
    dataTransfer: DataTransfer
  ) {
    if (this.lastPointerTarget && this.lastPointerTarget !== target) {
      const event = new DragEvent("dragexit", {
        ...e.nativeEvent,
        dataTransfer,
      });
      return this.lastPointerTarget.dispatchEvent(event);
    }
  }
}
