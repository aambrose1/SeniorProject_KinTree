import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { ReactComponent as ImportIcon } from '../../assets/import.svg';
import { useCurrentUser } from '../../CurrentUserProvider';
import { editTreeMember } from '../../../../server/controllers/treeMemberController';

Function editTreeMember({ trigger, userid }) {



}