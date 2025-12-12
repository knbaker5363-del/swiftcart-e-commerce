import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-background p-4" 
          dir="rtl"
        >
          <div className="text-center space-y-6 max-w-md mx-auto">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                😔 عذراً، حدث خطأ غير متوقع
              </h1>
              <p className="text-muted-foreground">
                نعتذر عن هذا الخطأ. يرجى تحديث الصفحة أو العودة للصفحة الرئيسية
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={this.handleReload}
                className="gap-2 min-h-[44px]"
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث الصفحة
              </Button>
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="gap-2 min-h-[44px]"
                size="lg"
              >
                <Home className="h-4 w-4" />
                الصفحة الرئيسية
              </Button>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-right">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto text-left" dir="ltr">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
