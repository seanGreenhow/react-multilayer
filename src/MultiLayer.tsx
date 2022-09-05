import * as React from "react";
import ClickCaptureLayer from "./ClickCaptureLayer";
import DragHandler from "./DragHandler";
import Layer, { layerStyles } from "./Layer";

export default class Multilayer<Props = {}, State = {}> extends Layer<
  Props & { dragHandler?: DragHandler },
  State
> {
  layers: Layer[] = [];
  readonly clickCaptureLayer = React.createRef<ClickCaptureLayer>();
  dragHandler: DragHandler;

  constructor(props) {
    super(props);
    if (props.dragHandler) this.dragHandler = props.dragHandler;
    else this.dragHandler = new DragHandler();
  }

  getPropagator<T extends typeof MouseEvent>(EventType: T) {
    return (e: React.MouseEvent) => {
      const stopped = this.forEachLayer((layer) => {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element) {
          const new_event = new EventType(e.type, e.nativeEvent);
          return !element.dispatchEvent(new_event);
        }
      });

      if (stopped) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }

  private forEachLayerRaw(func: (layer: Layer) => any) {
    const layers = this.layers.slice();
    let stopped: boolean;
    for (const layer of layers.reverse()) {
      stopped = func(layer);
      if (stopped) break;
    }
    return stopped;
  }

  forEachLayer(func: (layer: Layer) => any) {
    this.clickCaptureLayer.current.ref.current.style.pointerEvents = "none";

    const stopped = this.forEachLayerRaw((layer) => {
      this.layers
        .filter((other_layer) => other_layer != layer)
        .forEach((other_layer) => {
          other_layer.ref.current.style.pointerEvents = "none";
        });
      layer.ref.current.style.pointerEvents = "all";

      return func(layer);
    });

    this.clickCaptureLayer.current.ref.current.style.pointerEvents = "inherit";
    this.forEachLayerRaw((layer) => {
      layer.ref.current.style.pointerEvents = "inherit";
    });

    return stopped;
  }

  render() {
    return (
      <div id={this.props.id} style={layerStyles} ref={this.ref}>
        {this.reset() &&
          React.Children.map(
            this.props.children,
            (element: React.ReactElement<Layer>) => {
              if (element && typeof element.type != "string") {
                if (
                  element.type === Multilayer ||
                  element.type.prototype instanceof Multilayer
                ) {
                  return React.cloneElement(element, {
                    ref: (el: Layer) => {
                      if (el) this.layers.push(el);
                    },
                    dragHandler: this.dragHandler,
                  } as any);
                } else if (
                  element.type === Layer ||
                  element.type.prototype instanceof Layer
                ) {
                  return React.cloneElement(element, {
                    ref: (el: Layer) => {
                      if (el) this.layers.push(el);
                    },
                  } as any);
                }
              }
              return null;
            }
          )}
        <ClickCaptureLayer
          wrapper={this}
          ref={this.clickCaptureLayer}
          dragHandler={this.dragHandler}
          nested={!!this.props.dragHandler}
        />
      </div>
    );
  }

  reset() {
    this.layers = [];
    return true;
  }
}
