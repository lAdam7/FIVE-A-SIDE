import * as React from 'react';
import * as GoogleSession from 'expo-auth-session/providers/google';

/**
 * Google login, prompt the user to select their Google account
 * if successful logging the user in
 * 
 * @author Adam Lyon W19023403
 */
function Google() {
    const [request, response, promptAsync] = GoogleSession.useAuthRequest({ // api details required for login
    	
    });

	React.useEffect(() => {
		if (response?.type === 'success') {
			const { authentication } = response;
		}
	}, [response]);
  
  promptAsync() // prompt user to login
}
  
export default Google;