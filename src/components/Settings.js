import React, { useState } from 'react';
import { Button, Offcanvas, Form } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import Cookies from 'js-cookie';

const Settings = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [openAIKey, setOpenAIKey] = useState(Cookies.get('openai-key') || '');
  const [elevenLabsKey, setElevenLabsKey] = useState(Cookies.get('elevenlabs-key') || '');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);

  const handleSettingsClose = () => setShowSettings(false);
  const handleSettingsShow = () => setShowSettings(true);

  const saveAPIKeys = () => {
    Cookies.set('openai-key', openAIKey);
    Cookies.set('elevenlabs-key', elevenLabsKey);
    handleSettingsClose();
  };

  return (
    <>
      <Button variant="outline-secondary" onClick={handleSettingsShow}>
        Settings
      </Button>

      <Offcanvas
        placement="end"
        show={showSettings}
        onHide={handleSettingsClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Settings</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Your form and logic for updating the API keys */}
          <Form>
            <Form.Group controlId="openai-key">
              <Form.Label>OpenAI API Key</Form.Label>
              <Form.Control
                type={showOpenAIKey ? "text" : "password"}
                placeholder="Enter OpenAI API Key"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
              />
              <Button variant="link" onClick={() => setShowOpenAIKey(!showOpenAIKey)}>
                {showOpenAIKey ? <EyeSlash /> : <Eye />}
              </Button>
            </Form.Group>

            <Form.Group controlId="elevenlabs-key">
              <Form.Label>ElevenLabs API Key</Form.Label>
              <Form.Control
                type={showElevenLabsKey ? "text" : "password"}
                placeholder="Enter ElevenLabs API Key"
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value)}
              />
              <Button variant="link" onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}>
                {showElevenLabsKey ? <EyeSlash /> : <Eye />}
              </Button>
            </Form.Group>

            <Button variant="primary" onClick={saveAPIKeys}>
              Save
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Settings;
