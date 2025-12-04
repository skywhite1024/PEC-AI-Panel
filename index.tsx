// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('=== index.tsx 开始加载 ===');

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('=== React 错误边界捕获到错误 ===');
    console.error('错误:', error);
    console.error('错误信息:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
          <h1 style={{ color: 'red' }}>应用发生错误</h1>
          <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
console.log('root 元素:', rootElement);

if (!rootElement) {
  console.error('找不到 root 元素！');
  throw new Error("Could not find root element to mount to");
}

console.log('准备创建 React root...');

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root 创建成功，准备渲染...');
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('=== render() 调用完成 ===');
} catch (error) {
  console.error('=== 渲染过程中发生错误 ===');
  console.error(error);
}