import { render, screen } from '@testing-library/react'
import AnimatedText from './index'

describe('AnimatedText', () => {
  it('renders the text', async () => {
    render(<AnimatedText text="Hello, World!" animationType="typewriter" />)
    const animatedElement = await screen.findByText(
      'Hello, World!',
      {},
      { timeout: 3000 }
    )
    expect(animatedElement).toBeInTheDocument()
  })
  it('renders the text with letter-by-letter animation', async () => {
    render(
      <AnimatedText text="Hello, World!" animationType="letter-by-letter" />
    )
    const animatedElement = await screen.findByText(
      (content, element) => {
        const hasText = (node: Element) => node.textContent === 'Hello, World!'
        const elementHasText = hasText(element as Element)
        const childrenDontHaveText = Array.from(element?.children || []).every(
          (child) => !hasText(child)
        )
        return elementHasText && childrenDontHaveText
      },
      {},
      { timeout: 3000 }
    )
    expect(animatedElement).toBeInTheDocument()
  })
  it('renders the text with glitch animation', async () => {
    render(<AnimatedText text="Hello, World!" animationType="glitch" />)
    const animatedElement = await screen.findByText(
      'Hello, World!',
      {},
      { timeout: 3000 }
    )
    expect(animatedElement).toBeInTheDocument()
  })
  it('renders the text with gradient animation', () => {
    render(<AnimatedText text="Hello, World!" animationType="gradient" />)
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })
  it('renders the text with word-morph animation', async () => {
    render(<AnimatedText text="Hello World" animationType="word-morph" />)
    const animatedElement = await screen.findByText('Hello', {}, { timeout: 3000 })
    expect(animatedElement).toBeInTheDocument()
  })
  it('renders the text with 3d-transform animation', () => {
    render(<AnimatedText text="Hello, World!" animationType="3d-transform" />)
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })
  it('renders the text with kinetic animation', () => {
    render(<AnimatedText text="Hello, World!" animationType="kinetic" />)
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })
})
