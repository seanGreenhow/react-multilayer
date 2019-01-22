import * as React from "react"
import * as ReactDOM from "react-dom"
import { Layer, Multilayer } from "..";

function allowDrop(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
}

function drag(ev: React.DragEvent<HTMLDivElement>) {
    ev.dataTransfer.setData("text", (ev.target as any).id);
}

function drop(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    (ev.target as any).appendChild(document.getElementById(data));
    // event.target is the highest element on the layer, but should probably be the recieving object (aka the div with the onDrop trigger)
}


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


                <Layer id="Layer 4"
                    style={{
                        width: "25%",
                        backgroundColor: "rgba(255,0,0,0.5)"
                    }}
                >
                    DragLayer
                    <div onDrop={drop}
                        onDragEnter={() => console.log('entered drag zone')}
                        onDragLeave={() => console.log('left drag zone')}
                        style={{ width: 100, height: 100, background: 'gray', borderWidth: 1, borderColor: 'black', borderStyle: 'solid' }}>
                        <div id="drag1" draggable={true} onDragStart={drag} onClick={() => console.log('drag object clicked')} style={{ background: 'green' }}>
                            Dragable
                        </div>
                    </div>
                    <div onDrop={drop}
                        onDragEnter={() => console.log('entered drag zone')}
                        onDragLeave={() => console.log('left drag zone')}
                        style={{ width: 100, height: 100, background: 'gray', borderWidth: 1, borderColor: 'black', borderStyle: 'solid' }}>

                    </div>
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
                    <Layer id="Layer 5"
                        style={{
                            top: '75%',
                            width: "25%",
                            backgroundColor: "rgba(255,0,0,0.5)"
                        }}
                    >
                        NestedDragLayer
                        <div onDrop={drop}
                            onDragEnter={() => console.log('entered NestedDrag zone')}
                            onDragLeave={() => console.log('left NestedDrag zone')}
                            style={{ width: 100, height: 100, background: 'gray', borderWidth: 1, borderColor: 'black', borderStyle: 'solid' }}>
                            <div id="drag2" draggable={true} onDragStart={drag} onClick={() => console.log('drag object clicked')} style={{ background: 'green' }}>
                                Nested Dragable
                        </div>
                        </div>
                        <div onDrop={drop}
                            onDragEnter={() => console.log('entered NestedDrag zone')}
                            onDragLeave={() => console.log('left NestedDrag zone')}
                            style={{ width: 100, height: 100, background: 'gray', borderWidth: 1, borderColor: 'black', borderStyle: 'solid' }}>

                        </div>
                    </Layer>
                </Multilayer>

            </Multilayer>
        </div>
    ), document.getElementById("root"))
}