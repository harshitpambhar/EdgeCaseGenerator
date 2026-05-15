import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify'; 
import './index.css';
import App from './App.jsx';

// Configure Amplify to talk to your AWS Cognito Pool
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-south-1_RrUI9wYQd',
      userPoolClientId: '3lqhc2d932on64c1obehvdn59s',
      
      // NEW: OAuth settings for Google/GitHub
      loginWith: {
        oauth: {
          // Notice there is no https:// here, just the pure domain!
          domain: 'ap-south-1rrui9wyqd.auth.ap-south-1.amazoncognito.com', 
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: ['http://localhost:5173/dashboard'], // Where to go after Google login
          redirectSignOut: ['http://localhost:5173/'], // Where to go after logout
          responseType: 'code'
        }
      }
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);