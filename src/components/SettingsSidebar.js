import React, { useState } from 'react';  
import { Button, Offcanvas } from 'react-bootstrap';  
import Cookies from 'js-cookie';  

function SettingsSidebar() {  
  const [showSidebar, setShowSidebar] = useState(false);  
  const [openAIKey, setOpenAIKey] = useState('');  
  const [elevenLabsKey, setElevenLabsKey] = useState('');  
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);

  const handleOpenAIKeyChange = (e) => {  
    setOpenAIKey(e.target.value);  
  };  

  const handleElevenLabsKeyChange = (e) => {  
    setElevenLabsKey(e.target.value);  
  };  

  const saveAPIKeys = () => {  
    // Save the API keys to secure cookies  
    Cookies.set('openai-key', openAIKey, { secure: true, sameSite: 'strict' });  
    Cookies.set('elevenlabs-key', elevenLabsKey, { secure: true, sameSite: 'strict' });  
    console.log('API keys saved to secure cookies');  
  };  

  return (  
    <>
      <Button variant="primary" onClick={() => setShowSidebar(true)}>Settings</Button>  
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="end">  
        <Offcanvas.Header closeButton>  
          <Offcanvas.Title>API Keys</Offcanvas.Title>  
        </Offcanvas.Header>  
        <Offcanvas.Body>  
          <label htmlFor="openai-key">OpenAI API Key:</label>  
          <input  
            type={showOpenAIKey ? "text" : "password"}  
            id="openai-key"  
            value={openAIKey}  
            onChange={handleOpenAIKeyChange}  
          />  
          <Button onClick={() => setShowOpenAIKey(!showOpenAIKey)}>{showOpenAIKey ? "Hide" : "View"}</Button>
          <label htmlFor="elevenlabs-key">ElevenLabs API Key:</label>  
          <input  
            type={showElevenLabsKey ? "text" : "password"}  
            id="elevenlabs-key"  
            value={elevenLabsKey}  
            onChange={handleElevenLabsKeyChange}  
          />  
          <Button onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}>{showElevenLabsKey ? "Hide" : "View"}</Button>
          <Button onClick={saveAPIKeys} className="mt-3">Save API Keys</Button>  
        </Offcanvas.Body>  
      </Offcanvas>  
    </>  
  );  
}  

export default SettingsSidebar;
