import { useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';

const VoiceflowWidget = () => {
  const { token, user } = useContext(AuthContext); 

  useEffect(() => {
    const payloadName = user ? user.firstName : "Guest";
    const script = document.createElement('script');
    script.id = 'voiceflow-chat-script';
    script.type = 'text/javascript';

    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: '68fb3fd25900cf0c35855c7c' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production',
        launch: { 
          event: {
            type: 'launch',
            payload: {
              user_token: token,
              user_name: payloadName
            }
          }
        }
      });
    };

    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; 
    document.head.appendChild(script);

    return () => {

      if (window.voiceflow && typeof window.voiceflow.chat.destroy === 'function') {
        window.voiceflow.chat.destroy();
      }
      
      const existingScript = document.getElementById('voiceflow-chat-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [token, user]);

  return null; 
};

export default VoiceflowWidget;