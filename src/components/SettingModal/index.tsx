import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import './index.css';

interface SettingModalProps {
  settingValues: object;
  setSettingValues: (apply: boolean, value: string) => void;
}

const SettingModal = ({ settingValues, setSettingValues }: SettingModalProps) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    $('.setting-modal-header').on('mousedown', function (e: any) {
      const startPosX = e.pageX;
      const startPosY = e.pageY;
      const top = $('.setting-modal')
        .css('top')
        .slice(0, -2);
      const left = $('.setting-modal')
        .css('left')
        .slice(0, -2);
      $('.setting-modal-header').on('mousemove', function (e1: any) {
        const curPosX = e1.pageX;
        const curPosY = e1.pageY;
        $('.setting-modal').css('top', 1 * parseInt(top) + curPosY - startPosY + 'px');
        $('.setting-modal').css('left', 1 * parseInt(left) + curPosX - startPosX + 'px');
      });
    });
    $('.setting-modal-header').on('mouseup', function () {
      $('.setting-modal-header').off('mousemove');
    });
  });

  return (
    <div className="setting-modal">
      <div className="setting-modal-header">
        <h3>Setting</h3>
        <div className="icon-close" onClick={() => setSettingValues(false, value)} />
      </div>
      <div className="setting-modal-body">
        <input value={value} onChange={e => setValue(e.target.value)} />
      </div>
      <div className="setting-modal-footer">
        <button className="btn-setting btn btn-primary" onClick={() => setSettingValues(true, value)}>
          OK
        </button>
        <button className="btn-close btn btn-secondary" onClick={() => setSettingValues(false, value)}>
          Close
        </button>
      </div>
    </div>
  );
}

SettingModal.propTypes = {
  settingValues: PropTypes.object,
  setSettingValues: PropTypes.func,
};

SettingModal.defaultProps = {
  settingValues: {},
  // setSettingValues: () => void
};

export { SettingModal };