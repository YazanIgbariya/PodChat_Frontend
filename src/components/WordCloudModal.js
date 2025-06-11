import React from "react";
import WordCloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import "./WordCloudModal.css"; // create a simple modal style

export default function WordCloudModal({ words, onClose }) {
  return (
    <div className="graph-modal-overlay">
      <div className="graph-modal-content">
        <h3>Word Cloud</h3>
        <div style={{ height: 300 }}>
          <WordCloud
            words={words}
            options={{
              rotations: 2,
              rotationAngles: [-90, 0],
              fontSizes: [14, 50],
            }}
          />
        </div>
        <button onClick={onClose} className="graph-close-button">
          Close
        </button>
      </div>
    </div>
  );
}
