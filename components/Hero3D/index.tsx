'use client'

import React, { useRef, useMemo, Suspense, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Mesh } from 'three'
import * as THREE from 'three'
import { useSpring, a } from '@react-spring/three'

const Shape = ({ geometry, material, position, rotationSpeed }) => {
  const mesh = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  const { scale } = useSpring({
    scale: clicked ? 1.5 : 1,
    config: { mass: 1, tension: 170, friction: 26 },
  })

  useFrame(() => {
    if (mesh.current && !hovered) {
      mesh.current.rotation.x += rotationSpeed.x
      mesh.current.rotation.y += rotationSpeed.y
    }
  })

  return (
    <a.mesh
      ref={mesh}
      position={position}
      geometry={geometry}
      material={material}
      scale={scale}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  )
}

const Shapes = () => {
  const shapes = useMemo(() => {
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.ConeGeometry(0.5, 1, 32),
      new THREE.TorusGeometry(0.3, 0.1, 16, 100),
    ]

    const materials = [
      new THREE.MeshStandardMaterial({ color: 'orange' }),
      new THREE.MeshStandardMaterial({ color: 'lightblue' }),
      new THREE.MeshStandardMaterial({ color: 'hotpink' }),
      new THREE.MeshStandardMaterial({ color: 'limegreen' }),
    ]

    return Array.from({ length: 10 }).map((_, i) => {
      const geometry = geometries[i % geometries.length]
      const material = materials[i % materials.length]
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      )
      const rotationSpeed = {
        x: Math.random() * 0.01,
        y: Math.random() * 0.01,
      }
      return { geometry, material, position, rotationSpeed }
    })
  }, [])

  return (
    <>
      {shapes.map((shape, i) => (
        <Shape key={i} {...shape} />
      ))}
    </>
  )
}

const Scene = () => {
  const { size } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useFrame(({ camera }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.current.x * 2, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -mouse.current.y * 2, 0.05)
    camera.lookAt(0, 0, 0)
  })

  const handleMouseMove = (event) => {
    mouse.current = {
      x: (event.clientX / size.width) - 0.5,
      y: (event.clientY / size.height) - 0.5,
    }
  }

  return (
    <group onPointerMove={handleMouseMove}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <Shapes />
      </Suspense>
    </group>
  )
}

const Hero3D = ({ children }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Scene />
        </Canvas>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default Hero3D
