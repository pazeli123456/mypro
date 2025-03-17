import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">
                            משהו השתבש
                        </h1>
                        <p className="text-gray-600 mb-6">
                            אנחנו מצטערים, אבל קרתה תקלה. אנא נסה שוב.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                            >
                                חזור לדף הבית
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                            >
                                רענן דף
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;