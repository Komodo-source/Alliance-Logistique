import React from 'react';
import { View, Text, Button } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // You can log error to an error reporting service here
    console.log('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Something went wrong.</Text>
          <Text selectable>{this.state.error?.toString()}</Text>
          <Text selectable>{this.state.errorInfo?.componentStack}</Text>
          <Button title="Reload" onPress={() => { this.setState({ hasError: false, error: null, errorInfo: null }); }} />
        </View>
      );
    }
    return this.props.children;
  }
} 