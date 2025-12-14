import './EditorControls.css';

const EditorControls = ({ settings, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  const backgroundPresets = [
    { name: 'Transparent', value: 'transparent' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Gradient Blue', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Gradient Pink', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Gradient Green', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  ];

  return (
    <div className="editor-controls">
      <div className="control-section">
        <h3>Border</h3>
        <div className="control-group">
          <label>
            Width: {settings.borderWidth}px
            <input
              type="range"
              min="0"
              max="50"
              value={settings.borderWidth}
              onChange={(e) => handleChange('borderWidth', parseInt(e.target.value))}
            />
          </label>
          <label>
            Color:
            <input
              type="color"
              value={settings.borderColor}
              onChange={(e) => handleChange('borderColor', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Border Radius</h3>
        <div className="control-group">
          <label>
            Radius: {settings.borderRadius}px
            <input
              type="range"
              min="0"
              max="100"
              value={settings.borderRadius}
              onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Padding</h3>
        <div className="control-group">
          <label>
            Padding: {settings.padding}px
            <input
              type="range"
              min="0"
              max="100"
              value={settings.padding}
              onChange={(e) => handleChange('padding', parseInt(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Background</h3>
        <div className="control-group">
          <label>
            Custom Color:
            <input
              type="color"
              value={settings.backgroundColor === 'transparent' ? '#ffffff' : settings.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
            />
          </label>
          <div className="background-presets">
            {backgroundPresets.map((preset) => (
              <button
                key={preset.name}
                className={`preset-btn ${settings.backgroundColor === preset.value ? 'active' : ''}`}
                style={{ background: preset.value }}
                onClick={() => handleChange('backgroundColor', preset.value)}
                title={preset.name}
              >
                {preset.name === 'Transparent' && '⊘'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="control-section">
        <h3>Effects</h3>
        <div className="control-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.shadow}
              onChange={(e) => handleChange('shadow', e.target.checked)}
            />
            Drop Shadow
          </label>
        </div>
      </div>
    </div>
  );
};

export default EditorControls;
