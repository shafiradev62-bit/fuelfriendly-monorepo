import { googleAuthService } from './googleAuth';

// Example usage of Google Auth Service
export const testGoogleAuth = async () => {
  console.log('Testing Google Auth Service...');
  
  try {
    // Sign in
    const result = await googleAuthService.signIn();
    
    if (result.success) {
      console.log('✅ Google Sign-In successful!');
      console.log('User:', result.user);
      console.log('Firebase user:', result.firebaseUser);
      
      // Sign out after 3 seconds for testing
      setTimeout(async () => {
        await googleAuthService.signOut();
        console.log('✅ Signed out successfully');
      }, 3000);
      
      return result;
    } else {
      console.error('❌ Google Sign-In failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing Google Auth:', error);
    return null;
  }
};

// Export for use in components
export { googleAuthService };
