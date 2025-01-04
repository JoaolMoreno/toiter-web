import React, { useState } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  padding-right: 40px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.regular};
  margin: 0;
  height: 44px; // Match height with regular inputs
`;

const EyeButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  height: 20px;
  margin: 0;
`;

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputWrapper>
      <StyledInput
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <EyeButton
        type="button"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? "👁️" : "👁️‍🗨️"}
      </EyeButton>
    </InputWrapper>
  );
};

export default PasswordInput;