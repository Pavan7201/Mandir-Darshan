import { useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';

const VoiceflowWidget = () => {
  const { token } = useContext(AuthContext); 

  useEffect(() => {

    const script = document.createElement('script');
    script.id = 'voiceflow-chat-script';
    script.type = 'text/javascript';

    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: '68e8fd93ec7fdb503a33409e' },
        url: 'https://general-runtime.voiceflow.com',
        session: {
          variables: {
            user_token: token 
          }
        }
      });
    };

    script.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('voiceflow-chat-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [token]);

  return null; 
};

export default VoiceflowWidget;