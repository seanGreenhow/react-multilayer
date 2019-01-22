import * as React from "react";

type PropType<Type> = Type extends React.Component<infer P> ? P : never
type ReactElement<Type> = React.ReactElement<PropType<Type>>

export class Layer<Props = {}, State = {}> extends React.Component<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    readonly ref = React.createRef<HTMLDivElement>()
    lastPointerTarget: Element

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
            const event = new MouseEvent('mouseenter', { ...e, bubbles: false })
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

    checkDragTrigger(target: Element, e: React.MouseEvent<HTMLDivElement>, dataTransfer: DataTransfer) {
        this.checkDragExit(target, e, dataTransfer)
        this.checkDragLeave(target, e, dataTransfer)
        this.checkDragOver(target, e, dataTransfer)
        this.checkDragEnter(target, e, dataTransfer)
    }

    private checkDragEnter(target: Element, e: React.MouseEvent<HTMLDivElement>, dataTransfer: DataTransfer) {
        if (this.lastPointerTarget !== target && target && !target.contains(this.lastPointerTarget)) {
            const event = new DragEvent('dragenter', { ...e, bubbles: false, dataTransfer })
            console.log('dragenter ', event, ' triggered', ' on ', target)
            target.dispatchEvent(event)
        }
    }

    private checkDragOver(target: Element, e: React.MouseEvent<HTMLDivElement>, dataTransfer: DataTransfer) {
        if (target && this.lastPointerTarget !== target) {
            const event = new DragEvent('dragover', { ...e, dataTransfer })
            console.log('dragover triggered', ' on ', target)
            target.dispatchEvent(event)
        }
    }

    private checkDragLeave(target: Element, e: React.MouseEvent<HTMLDivElement>, dataTransfer: DataTransfer) {
        if (this.lastPointerTarget !== target && this.lastPointerTarget && !this.lastPointerTarget.contains(target)) {
            const event = new DragEvent('dragleave', { ...e, bubbles: false, dataTransfer })
            console.log('dragleave triggered', ' on ', this.lastPointerTarget)
            this.lastPointerTarget.dispatchEvent(event)
        }
    }

    private checkDragExit(target: Element, e: React.MouseEvent<HTMLDivElement>, dataTransfer: DataTransfer) {
        if (this.lastPointerTarget && this.lastPointerTarget !== target) {
            const event = new DragEvent('dragexit', { ...e, dataTransfer })
            console.log('dragexit triggered', ' on ', this.lastPointerTarget)
            this.lastPointerTarget.dispatchEvent(event)
        }
    }
}

export class Multilayer<Props = {}, State = {}> extends Layer<Props & { dragHandler?: DragHandler }, State> {
    layers: Layer[] = []
    readonly clickCaptureLayer = React.createRef<ClickCaptureLayer>()
    dragHandler: DragHandler

    constructor(props) {
        super(props)
        if (props.dragHandler) this.dragHandler = props.dragHandler
        else this.dragHandler = new DragHandler
    }

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
        this.clickCaptureLayer.current.ref.current.style.pointerEvents = 'none'

        const stopped = this.forEachLayerRaw(layer => {
            this.layers.filter(other_layer => other_layer != layer).forEach(other_layer => {
                other_layer.ref.current.style.pointerEvents = 'none'
            })
            layer.ref.current.style.pointerEvents = 'all'

            return func(layer)
        })

        this.clickCaptureLayer.current.ref.current.style.pointerEvents = 'inherit'
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
                        if (element.type === Multilayer || element.type.prototype instanceof Multilayer) {
                            return React.cloneElement(element, {
                                ref: (el: Layer) => { if (el) this.layers.push(el) },
                                dragHandler: this.dragHandler
                            } as any)
                        }
                        else if (element.type === Layer || element.type.prototype instanceof Layer) {
                            return React.cloneElement(element, {
                                ref: (el: Layer) => { if (el) this.layers.push(el) }
                            } as any)
                        }
                    }
                    return null
                })}
                <ClickCaptureLayer
                    wrapper={this}
                    ref={this.clickCaptureLayer}
                    dragHandler={this.dragHandler}
                    nested={!!this.props.dragHandler}
                />
            </div>
        )
    }

    reset() {
        this.layers = []
        return true
    }
}

class ClickCaptureLayer extends React.Component<{ wrapper: Multilayer, dragHandler: DragHandler, nested?: boolean }> {
    readonly ref = React.createRef<HTMLDivElement>()

    render() {
        const mousePropagator = this.props.wrapper.getPropagator(MouseEvent)
        const wheelPropagator = this.props.wrapper.getPropagator(WheelEvent)
        const dragPropagator = this.props.wrapper.getPropagator(DragEvent)

        return (<div style={layerStyles} ref={this.ref}
            onClick={mousePropagator}
            onDoubleClick={mousePropagator}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onContextMenu={mousePropagator}

            onWheel={wheelPropagator}

            //onDrag={dragPropagator}
            //onDragStart={dragPropagator}
            //onDragEnd={dragPropagator}
            //onDragEnter={dragPropagator}
            //onDragLeave={dragPropagator}
            //onDragOver={dragPropagator}
            //onDragExit={dragPropagator}
            //onDrop={dragPropagator}

            onMouseMove={this.handleMouseMove}
        />)
    }

    handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        this.props.wrapper.getPropagator(MouseEvent)(e)
        this.props.wrapper.forEachLayer(layer => {
            const target = document.elementFromPoint(e.clientX, e.clientY)

            let currentTarget = target
            let result: Element
            while (currentTarget) {
                if (currentTarget.hasAttribute('draggable') && currentTarget.getAttribute('draggable')) {
                    result = currentTarget
                    break;
                }
                currentTarget = currentTarget.parentElement
            }
            if (result) {
                this.props.dragHandler.dragTarget = result
                return true
            }
        })
    }

    handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        this.props.wrapper.getPropagator(MouseEvent)(e)

        if (this.props.dragHandler.dragging && !this.props.nested) {
            this.props.wrapper.forEachLayer(layer => {
                const target = document.elementFromPoint(e.clientX, e.clientY)
                const event = new DragEvent('drop', { ...e, dataTransfer: this.props.dragHandler.dragDataObject })
                target.dispatchEvent(event)
                if (event.defaultPrevented) return true
            })

            const event = new DragEvent('dragend', { ...e, dataTransfer: this.props.dragHandler.dragDataObject })
            this.props.dragHandler.dragTarget.dispatchEvent(event)
            this.props.dragHandler.dragging = false
            this.props.dragHandler.dragDataObject = undefined
        }
        if (this.props.dragHandler.dragTarget && !this.props.nested) this.props.dragHandler.dragTarget = undefined
    }

    handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        this.props.wrapper.getPropagator(MouseEvent)(e)

        if (this.props.dragHandler.dragTarget && !this.props.dragHandler.dragging && !this.props.nested) {
            this.props.dragHandler.dragDataObject = new DataTransfer
            const event = new DragEvent('dragstart', { ...e, dataTransfer: this.props.dragHandler.dragDataObject })

            this.props.dragHandler.dragTarget.dispatchEvent(event)
            this.props.dragHandler.dragging = true
        }

        this.props.wrapper.forEachLayer(layer => {
            const target = document.elementFromPoint(e.clientX, e.clientY)
            layer.checkMouseTrigger(target, e)



            if (this.props.dragHandler.dragTarget) {
                layer.checkDragTrigger(target, e, this.props.dragHandler.dragDataObject)
            }
            layer.lastPointerTarget = target
        })
    }
}

class DragHandler {
    dragging: boolean = false
    dragTarget: Element = undefined
    dragDataObject: DataTransfer = undefined
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