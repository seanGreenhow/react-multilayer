import * as React from "react";

type PropType<Type> = Type extends React.Component<infer P> ? P : never
type ReactElement<Type> = React.ReactElement<PropType<Type>>

export class Layer<Props = {}, State = {}> extends React.Component<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    ref: React.RefObject<HTMLDivElement>
    lastPointerTarget: Element

    constructor(props) {
        super(props)
        this.ref = React.createRef()
    }

    render() {
        const { style, children, ...rest } = this.props

        return (<div style={Object.assign({}, layerStyles, style ? style : {})} ref={this.ref} {...rest}>
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
            const event = new MouseEvent('mouseenter', { bubbles: false })
            target.dispatchEvent(event)
        }
    }

    private checkMouseOver(target: Element, e: React.MouseEvent<HTMLDivElement>) {
        if (target && this.lastPointerTarget !== target) {
            const event = new MouseEvent('mouseover', e)
            target.dispatchEvent(event)
        }
    }

    private checkMouseLeave(target: Element, e: React.MouseEvent<HTMLDivElement>) {
        if (this.lastPointerTarget !== target && this.lastPointerTarget && !this.lastPointerTarget.contains(target)) {
            const event = new MouseEvent('mouseleave', { ...e, bubbles: false })
            this.lastPointerTarget.dispatchEvent(event)
        }
    }

    private checkMouseOut(target: Element, e: React.MouseEvent<HTMLDivElement>) {
        if (this.lastPointerTarget && this.lastPointerTarget !== target) {
            const event = new MouseEvent('mouseout', e)
            this.lastPointerTarget.dispatchEvent(event)
        }
    }
}

export class Multilayer extends Layer {
    layers: Layer[] = []
    clickCaptureLayer: ClickCaptureLayer

    getPropagator<T extends typeof MouseEvent>(EventType: T) {
        return (e: React.MouseEvent) => {
            const stopped = this.forEachLayer(layer => {
                const element = document.elementFromPoint(e.clientX, e.clientY)
                if (element) {
                    const new_event = new EventType(e.type, e)
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
        this.clickCaptureLayer.ref.current.style.pointerEvents = 'none'

        const stopped = this.forEachLayerRaw(layer => {
            this.layers.filter(other_layer => other_layer != layer).forEach(other_layer => {
                other_layer.ref.current.style.pointerEvents = 'none'
            })
            layer.ref.current.style.pointerEvents = 'all'

            return func(layer)
        })

        this.clickCaptureLayer.ref.current.style.pointerEvents = 'inherit'
        this.forEachLayerRaw(layer => {
            layer.ref.current.style.pointerEvents = 'inherit'
        })

        return stopped
    }

    render() {
        return (
            <div id={this.props.id} style={layerStyles} ref={this.ref}>
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
    ref: React.RefObject<HTMLDivElement>

    constructor(props) {
        super(props)
        this.ref = React.createRef();
    }

    render() {
        const mousePropagator = this.props.wrapper.getPropagator(MouseEvent)
        const wheelPropagator = this.props.wrapper.getPropagator(WheelEvent)
        const dragPropagator = this.props.wrapper.getPropagator(DragEvent)

        return (<div style={layerStyles} ref={this.ref}
            onClick={mousePropagator}
            onDoubleClick={mousePropagator}
            onMouseDown={mousePropagator}
            onMouseUp={mousePropagator}
            onContextMenu={mousePropagator}

            onWheel={wheelPropagator}

            onDrag={dragPropagator}
            onDragStart={dragPropagator}
            onDragEnd={dragPropagator}
            onDragEnter={dragPropagator}
            onDragLeave={dragPropagator}
            onDragOver={dragPropagator}
            onDragExit={dragPropagator}
            onDrop={dragPropagator}

            onMouseMove={this.handleMouseMove}
        />)
    }

    handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        this.props.wrapper.getPropagator(MouseEvent)(e)
        this.props.wrapper.forEachLayer(layer => {
            const target = document.elementFromPoint(e.clientX, e.clientY)
            layer.checkMouseTrigger(target, e)
            layer.lastPointerTarget = target
        })
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