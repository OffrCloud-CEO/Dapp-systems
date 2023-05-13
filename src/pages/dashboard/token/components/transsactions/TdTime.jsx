import React from 'react';
import { calculateTimeDifference } from '../../../../../useful/useful_tool';

const TdTime = ({ timestamp }) => {
    return (
        <td className='mb'>{calculateTimeDifference(timestamp)}</td>
    )
}

export default TdTime;