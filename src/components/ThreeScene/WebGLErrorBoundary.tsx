'use client';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}
interface State {
  failed: boolean;
}

/** Any WebGL/R3F failure degrades to the static fallback instead of breaking the page. */
export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') console.warn('[ThreeScene] WebGL disabled:', error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
