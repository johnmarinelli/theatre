import {editable as e, SheetProvider, useCurrentSheet} from '@theatre/r3f'
import {OrbitControls} from '@react-three/drei'
import {getProject} from '@theatre/core'
import React, {useEffect, useRef, useLayoutEffect, useState} from 'react'
import {Canvas} from '@react-three/fiber'
import {LayerMaterial, Depth, Color, Fresnel, Noise} from 'lamina'
import {useThree} from '@react-three/fiber'
import {Color as ThreeColor} from 'three'
import p5 from './p5'

const Sketch = () => {
  const sheet = getProject('demo').sheet('Scene')
  const canvasParentRef = useRef()
  const [p5Object, setP5Object] = useState(null)

  useEffect(() => {
    const sketch = new p5((p) => {
      let ellipseHeight = 55

      const getEllipseHeight = () => ellipseHeight
      const r3fCanvas = document.querySelector('#r3f-canvas').children[0]

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
        canvas.parent(canvasParentRef.current)
        p.background(255, 0, 200)
        p.redraw()

        const sheetObject = sheet.object('Ellipse', {
          height: 55,
        })

        const setFromTheatre = (newValues) => {
          ellipseHeight = newValues.height
        }
        sheetObject.onValuesChange(setFromTheatre)
      }

      p.draw = () => {
        p.clear()
        p.drawingContext.drawImage(
          r3fCanvas,
          0,
          0,
          p.windowWidth,
          p.windowHeight,
        )
        p.text('John')
      }
    })

    return () => {
      p5Object?.remove()
    }
  }, [p5, sheet])

  return <div ref={canvasParentRef}></div>
}

function useInvalidate() {
  return useThree(({invalidate}) => invalidate)
}

document.body.style.backgroundColor = '#171717'

function DepthMaterial() {
  const objRef = useRef()
  const depthRef = useRef()
  const sheet = useCurrentSheet()
  const invalidate = useInvalidate()
  const [sheetObject, setSheetObject] = useState()

  useLayoutEffect(() => {
    if (!sheet) {
      return
    }
    const sheetObject = sheet.object('Depth Material', {
      colorA: '#ff0000',
    })
    setSheetObject(sheetObject)
    if (objRef) objRef!.current = sheetObject

    const setFromTheatre = (newValues) => {
      const dr = depthRef.current
      dr.colorA = new ThreeColor(newValues.colorA)
      invalidate()
    }

    sheetObject.onValuesChange(setFromTheatre)
  }, [sheet])

  return (
    <Depth
      ref={depthRef}
      colorA="white"
      colorB="#0f1c4d"
      near={0}
      far={2}
      origin={[1, 1, 1]}
      alpha={0.5}
      mode="normal"
    />
  )
}

function GradientSphere() {
  return (
    <mesh uniqueName="sphere">
      <sphereBufferGeometry args={[1, 32, 32]} />
      <LayerMaterial>
        <Color color="blue" />
        <DepthMaterial />
        <Depth
          colorA="red"
          near={3}
          far={2}
          origin={[-1, 1, 1]}
          alpha={0.5}
          mode="add"
        />
        <Fresnel
          mode="add"
          color="orange"
          intensity={0.5}
          power={2}
          bias={0.05}
        />
        <Noise
          scale={2}
          mapping="world"
          type="curl"
          colorA="white"
          colorB="#000000"
          mode="softlight"
        />
        <Noise
          mapping="local"
          /*type="curl" */ scale={100}
          colorA="#aaa"
          colorB="black"
          type="simplex"
          mode="softlight"
        />
        <Noise
          mapping="local"
          type="simplex"
          scale={100}
          colorA="white"
          colorB="black"
          mode="subtract"
          alpha={0.2}
        />
      </LayerMaterial>
    </mesh>
  )
}

function App() {
  const bgs = ['#272730', '#b7c5d1']
  const [bgIndex, setBgIndex] = useState(0)
  const bg = bgs[bgIndex]
  return (
    <div
      onClick={() => {
        // return setBgIndex((bgIndex) => (bgIndex + 1) % bgs.length)
      }}
    >
      <div
        style={{
          width: '100%',
          position: 'absolute',
          zIndex: -1,
          height: '100%',
        }}
      >
        <Canvas
          dpr={[1.5, 2]}
          linear
          shadows
          frameloop="demand"
          id="r3f-canvas"
        >
          <SheetProvider getSheet={() => getProject('demo').sheet('Scene')}>
            <fog attach="fog" args={[bg, 16, 30]} />
            <color attach="background" args={[bg]} />
            <ambientLight intensity={0.75} />
            <e.perspectiveCamera
              uniqueName="Camera"
              // @ts-ignore
              makeDefault
              position={[0, 0, 16]}
              fov={75}
            >
              <e.pointLight
                uniqueName="Light 1"
                intensity={1}
                position={[-10, -25, -10]}
              />
              <e.spotLight
                uniqueName="Light 2"
                castShadow
                intensity={2.25}
                angle={0.2}
                penumbra={1}
                position={[-25, 20, -15]}
                shadow-mapSize={[1024, 1024]}
                shadow-bias={-0.0001}
              />
            </e.perspectiveCamera>
            <GradientSphere />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
            />
          </SheetProvider>
        </Canvas>
      </div>
      <div style={{width: '100%', position: 'absolute'}}>
        <Sketch />
      </div>
    </div>
  )
}

export default App
