import * as React from "react"

export type HoverableProps = { hoverStyle?: React.CSSProperties } & React.HTMLAttributes<HTMLDivElement>

export default class Hoverable<Props = {}, State = {}> extends React.Component<HoverableProps & Props, Partial<{ hover: boolean } & State>> {
    readonly ref = React.createRef<HTMLDivElement>()

    constructor(props) {
        super(props)
        this.state = {
            hover: false
        } as Partial<{ hover: boolean } & State>
    }

    onmouseenter = (e) => {
        this.setState({ hover: true })
        if (this.props.onMouseEnter) this.props.onMouseEnter(e)
    }

    ommouseleave = (e) => {
        this.setState({ hover: false });
        if (this.props.onMouseLeave) this.props.onMouseLeave(e)
    }

    componentDidMount() {
        this.ref.current.addEventListener('mouseenter', this.onmouseenter)
        this.ref.current.addEventListener('mouseleave', this.ommouseleave)
    }

    componentWillUnmount() {
        this.ref.current.removeEventListener('mouseenter', this.onmouseenter)
        this.ref.current.removeEventListener('mouseleave', this.ommouseleave)
    }

    render() {
        const { style, hoverStyle, onMouseEnter, onMouseLeave, children, ...rest } = this.props

        return (
            <div ref={this.ref} style={Object.assign({}, style, this.state.hover ? hoverStyle : {})} {...rest} >
                {children}
            </div>
        )
    }
}