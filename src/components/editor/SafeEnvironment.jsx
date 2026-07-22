import React, { Component } from 'react';
import { Environment } from '@react-three/drei';

class SafeEnvironmentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("Failed to load Environment HDRI (likely due to network or CORS issues). Falling back to standard lighting.");
  }

  render() {
    if (this.state.hasError) {
      return (
        <group>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} />
          <directionalLight position={[-5, -10, -5]} intensity={0.8} />
          <directionalLight position={[0, 0, 5]} intensity={0.5} />
        </group>
      );
    }
    return this.props.children;
  }
}

export default function SafeEnvironment(props) {
  return (
    <SafeEnvironmentErrorBoundary>
      <Environment {...props} />
    </SafeEnvironmentErrorBoundary>
  );
}
