import * as React from "react";

type PropType<Type> = Type extends React.Component<infer P> ? P : never
type ReactElement<Type> = React.ReactElement<PropType<Type>>

export class Layer<Props = {}, State = {}> extends React.Component<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    ref: HTMLDivElement
    lastPointerTarget: Element

    render() {
        const { style, children, ...rest } = this.props

        return (<div style={Object.assign({}, layerStyles, style ? style : {})} ref={(ref) => this.ref = ref} {...rest}>
            {children}
        </div>)
    }

    checkMouseTrigger(target: Element, e: React.MouseEvent<HTMLDivElement>) {
        this.checkMouseOut(target, e)
        this.checkMouseLeave(target, e)
        this.checkMouseOver(target, e)
        this.checkMouseEnter(target, e)
    }

    private checkMouseEnter(target: Element, e: React.MouseEvent<HTMLDivElement>) {
        if (this.lastPointerTarget !== target && target && !target.contains(this.lastPointerTarget)) {
            let event = new MouseEvent('mouseenter', { bubbles: false })
            target.dispatchEvent(event)
        }
    }

    private checkMouseOver(target: Element, e: React.MouseEvent<HTMLDivElement>) {
        if (target && this.lastPointerTarget !== target) {
            let event = new MouseEvent('mouseover', e)
            target.dispatchEvent(event)
        }
    }

    private checkMouseLeave(target: Element, e: React.MouseEvent<HTMLDivElement>) {
        if (this.lastPointerTarget !== target && this.lastPointerTarget && !this.lastPointerTarget.contains(target)) {
            let event = new MouseEvent('mouseleave', { ...e, bubbles: false })
            this.lastPointerTarget.dispatchEvent(event)
        }
    }

    private checkMouseOut(target: Element, e: React.MouseEvent<HTMLDivElement>) {
        if (this.lastPointerTarget && this.lastPointerTarget !== target) {
            let event = new MouseEvent('mouseout', e)
            this.lastPointerTarget.dispatchEvent(event)
        }
    }
}

export class Multilayer extends Layer {
    layers: Layer[] = []
    clickCaptureLayer: ClickCaptureLayer

    getPropagator<T extends typeof MouseEvent>(EventType: T) {
        return (e: React.MouseEvent) => {
            let stopped = this.forEachLayer(layer => {
                let element = document.elementFromPoint(e.clientX, e.clientY)
                if (element) {
                    let new_event = new EventType(e.type, e)
                    return !element.dispatchEvent(new_event)
                }
            })
            if (stopped) {
                e.preventDefault()
                e.stopPropagation()
            }
        }
    }

    private forEachLayerRaw(func: (layer: Layer) => any) {
        const layers = this.layers.slice()
        let stopped: boolean
        for (const layer of layers.reverse()) {
            stopped = func(layer)
            if (stopped) break;
        }
        return stopped
    }

    forEachLayer(func: (layer: Layer) => any) {
        this.clickCaptureLayer.ref.style.pointerEvents = 'none'

        let stopped = this.forEachLayerRaw(layer => {
            this.layers.filter(other_layer => other_layer != layer).forEach(other_layer => {
                other_layer.ref.style.pointerEvents = 'none'
            })
            layer.ref.style.pointerEvents = 'all'

            return func(layer)
        })

        this.clickCaptureLayer.ref.style.pointerEvents = 'inherit'
        this.forEachLayerRaw(layer => {
            layer.ref.style.pointerEvents = 'inherit'
        })

        return stopped
    }

    render() {
        return (
            <div id={this.props.id} style={layerStyles} ref={(ref) => this.ref = ref}>
                {this.reset() && React.Children.map(this.props.children, (element: ReactElement<Layer>) => {
                    if (element && typeof element.type != "string") {
                        if (element.type === Layer || element.type.prototype instanceof Layer) {
                            return React.cloneElement(element, {
                                ref: (el: Layer) => { if (el) this.layers.push(el) }
                            } as any)
                        }
                    }
                    return null
                })}
                <ClickCaptureLayer
                    wrapper={this}
                    ref={clickLayer => this.clickCaptureLayer = clickLayer}
                />
            </div>
        )
    }

    reset() {
        this.layers = []
        return true
    }
}

class ClickCaptureLayer extends React.Component<{ wrapper: Multilayer }> {
    ref: HTMLDivElement
    render() {
        return (<div style={layerStyles} ref={(ref) => this.ref = ref}
            onClick={this.props.wrapper.getPropagator(MouseEvent)}
            onDoubleClick={this.props.wrapper.getPropagator(MouseEvent)}
            onMouseDown={this.props.wrapper.getPropagator(MouseEvent)}
            onMouseUp={this.props.wrapper.getPropagator(MouseEvent)}
            onContextMenu={this.props.wrapper.getPropagator(MouseEvent)}

            onWheel={this.props.wrapper.getPropagator(WheelEvent)}


            onDrag={this.props.wrapper.getPropagator(DragEvent)}
            onDragStart={this.props.wrapper.getPropagator(DragEvent)}
            onDragEnd={this.props.wrapper.getPropagator(DragEvent)}
            onDragEnter={this.props.wrapper.getPropagator(DragEvent)}
            onDragLeave={this.props.wrapper.getPropagator(DragEvent)}
            onDragOver={this.props.wrapper.getPropagator(DragEvent)}
            onDragExit={this.props.wrapper.getPropagator(DragEvent)}
            onDrop={this.props.wrapper.getPropagator(DragEvent)}


            onMouseMove={(e) => {
                this.props.wrapper.getPropagator(MouseEvent)(e)

                this.props.wrapper.forEachLayer(layer => {
                    let target = document.elementFromPoint(e.clientX, e.clientY)
                    layer.checkMouseTrigger(target, e)
                    layer.lastPointerTarget = target
                })

            }}
        />)
    }
}

export const layerStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    background: 'transparent'
}