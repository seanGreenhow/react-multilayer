import * as React from "react"
import * as ReactDOM from "react-dom"
import { Layer, Multilayer, Dropzone } from "..";

function dragStart(ev: React.DragEvent<HTMLElement>) {
    ev.dataTransfer.setData("text", (ev.target as any).id);
}

function drag(ev: React.DragEvent<HTMLElement>) {
    ev.persist()
    console.log(ev)
}

function drop(ev: DragEvent) {
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
                    <Dropzone id="dropzone1" onDrop={drop}
                        onDragEnter={() => console.log('entered drag zone')}
                        onDragLeave={() => console.log('left drag zone')}
                        onDragOver={() => console.log('over drag zone')}
                        onDragExit={() => console.log('exit drag zone')}
                        style={{ width: 100, height: 100, background: 'gray', borderWidth: 1, borderColor: 'black', borderStyle: 'solid' }}>
                        <div id="drag1" draggable
                            onDragStart={dragStart}
                            style={{ background: 'blue' }}
                            onDrag={drag}
                        >
                            Dragable
                        </div>
                    </Dropzone>
                    <Dropzone id="dropzone2" onDrop={drop}
                        onDragEnter={() => console.log('entered drag zone')}
                        onDragLeave={() => console.log('left drag zone')}
                        onDragOver={() => console.log('over drag zone')}
                        onDragExit={() => console.log('exit drag zone')}
                        style={{ width: 100, height: 100, background: 'gray', borderWidth: 1, borderColor: 'black', borderStyle: 'solid' }}>
                    </Dropzone>
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
                        <button
                            style={{ position: 'relative', background: 'rgb(255,255,255)', top: '33%' }}
                            onClick={(e) => console.log('Button on Layer 3')}
                            onMouseEnter={() => console.log('MouseEnter Button Layer 3')}
                        >Layer 3</button>
                    </Layer>
                    <Layer id="Layer 5"
                        style={{
                            top: '75%',
                            width: "25%",
                            backgroundColor: "rgba(255,0,0,0.5)"
                        }}
                    >
                        NestedDragLayer
                        <Dropzone id="dropzone3" onDrop={drop}
                            onDragEnter={() => console.log('entered NestedDrag zone')}
                            onDragLeave={() => console.log('left NestedDrag zone')}
                            onDragOver={() => console.log('over NestedDrag zone')}
                            onDragExit={() => console.log('exit NestedDrag zone')}
                            onMouseEnter={() => console.log('MouseEnter NestedDrag zone')}
                            style={{ width: 100, height: 100, background: 'gray', borderWidth: 1, borderColor: 'black', borderStyle: 'solid' }}>
                            <div id="drag2" draggable
                                onDragStart={dragStart}
                                onDragEnd={() => console.log('i just got dragged!')}
                                onClick={() => console.log('drag object clicked')} style={{ background: 'green' }}>
                                Nested
                            </div>
                        </Dropzone>
                        <Dropzone id="dropzone4" onDrop={drop}
                            onDragEnter={() => console.log('entered NestedDrag zone')}
                            onDragLeave={() => console.log('left NestedDrag zone')}
                            onDragOver={() => console.log('over NestedDrag zone')}
                            onDragExit={() => console.log('exit NestedDrag zone')}
                            style={{ width: 100, height: 100, background: 'gray', borderWidth: 1, borderColor: 'black', borderStyle: 'solid' }}>

                        </Dropzone>
                    </Layer>
                </Multilayer>

            </Multilayer>
        </div>
    ), document.getElementById("root"))
}