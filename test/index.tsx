import * as React from "react"
import * as ReactDOM from "react-dom"
import { Layer, Multilayer } from "..";

window.onload = async () => {
    ReactDOM.render((
        <div style={{ height: '100%' }}>
            <Multilayer id="Multilayer 1">
                <Layer id="Layer 1" style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(255,0,0,0.5)"
                }}>
                    <button style={{ position: 'relative', background: 'rgb(255,255,255)', top: '33%' }}
                        onClick={(e) => console.log('Button on Layer 1')}
                    >Layer 1</button>
                </Layer>
                <Multilayer id="Multilayer 2">
                    <Layer id="Layer 2"
                        style={{
                            width: "50%",
                            backgroundColor: "rgba(255,0,0,0.5)"
                        }}
                    >
                        <button style={{ position: 'relative', background: 'rgb(255,255,255)', top: '66%' }} onClick={(e) => console.log('Button on Layer 2')}
                        >Layer 2</button>
                    </Layer>
                    <Layer id="Layer 3"
                        style={{
                            width: "50%",
                            height: "50%",
                            backgroundColor: "rgba(255,0,0,0.5)"
                        }}
                    >
                        <button style={{ position: 'relative', background: 'rgb(255,255,255)', top: '33%' }} onClick={(e) => console.log('Button on Layer 3')}>Layer 3</button>
                    </Layer>
                </Multilayer>
            </Multilayer>
        </div>
    ), document.getElementById("root"))
}