import { useState } from 'react';
import useFileUpload from '../../hooks/useFileUpload';

export default function Employees() {

    const [
        file,
        inputRef,
        handleClick,
        onCancel,
        handleFileChange,
        fileAsText,
        error
    ] = useFileUpload();

    const [showInput, setShowInput] = useState(false);

    const toggleInput = () => {
        setShowInput(!showInput);
    }

    const convertToDate = string => {
        return string !== 'NULL' && string !== 'undefined' && string !== ''
            ? Date.parse(string)
            : Date.now()
    }

    const calculateDaysTogether = (firstEmployee, secondEmployee) => {
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor((
            Math.min
                (
                    convertToDate(firstEmployee.dateTo),
                    convertToDate(secondEmployee.dateTo)
                ) -
            Math.max
                (
                    convertToDate(firstEmployee.dateFrom),
                    convertToDate(secondEmployee.dateFrom)
                )
        ) / oneDay);
    };

    const csvToObject = textContent => {
        const rows = textContent.split(/(?:\r\n|n)+/).filter(e => e.length !== 0);
        const headers = ['empId', 'projectId', 'dateFrom', 'dateTo'];
        if (/projectID/i.test(rows[0])) {
            rows.shift();
        }
        const result = rows.map(r => r
            .split(/,|;/)
            .reduce((acc, curr, i) => {
                curr = curr.trim();
                const key = headers[i];
                return { ...acc, [key]: curr }
            }, {}));
        return result;
    };

    const findLongestPeriod = data => {
        let longestPeriod = 0;
        let resultArray = [];
        data.forEach((e, i) => {
            const remainingEntries = data.slice(i + 1);
            remainingEntries.forEach(r => {
                if (e.projectId !== r.projectId) {
                    return;
                }
                if (e.dateFrom >= r.dateTo || r.dateFrom >= e.dateTo) {
                    return;
                }
                const workedTogether = calculateDaysTogether(e, r);
                if (workedTogether === longestPeriod) {
                    resultArray.push([e.empId, r.empId, workedTogether]);
                }
                if (workedTogether > longestPeriod) {
                    resultArray = [[e.empId, r.empId, workedTogether]];
                    longestPeriod = workedTogether;
                }
            });
        });
        return resultArray;
    };

    const fileContent = fileAsText
        ? csvToObject(fileAsText)
        : null;
        
    const result = fileContent
        ? findLongestPeriod(fileContent)
        : null;

    return (
        <>
            <div className='file-select'>
                <input
                    accept=".csv"
                    type="file"
                    ref={inputRef}
                    hidden
                    onChange={handleFileChange}
                />
                {file &&
                    <div>
                        <button className='button green' onClick={toggleInput}>{showInput ? 'Hide file content' : 'Show file content'}</button>
                        <button className='button red' onClick={() => { toggleInput(); onCancel(); }} >Close file</button>
                    </div>
                }
                <button className='button' onClick={handleClick} >{file ? `${file.name} selected` : 'Select file'}</button>
            </div>

            {error && <p className='error'>{error}</p>}

            {result && (result.length !== 0
                ? <div className='results'>
                    <table className='results-table'>
                        <thead>
                            <tr>
                                <th>Employee ID #1</th>
                                <th>Employee ID #2</th>
                                <th>Days worked together</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.map(e =>
                                <tr key={e.join('')}>
                                    {e.map(x => <td key={x}>{x}</td>)}
                                </tr>)}
                        </tbody>
                    </table>
                </div>
                : <p>No common projects or working interval!</p>)
            }

            {showInput && fileContent && (Object.values(fileContent[0]).length === 4
                ? <div className='input'>
                    <table className='input-table'>
                        <thead>
                            <tr>
                                <th>EmpID</th>
                                <th>ProjectID</th>
                                <th>DateFrom</th>
                                <th>DateTo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fileContent.map(e =>
                                <tr key={Object.values(e).join('')}>
                                    {Object.values(e).map(x => <td key={x}>{x}</td>)}
                                </tr>)}
                        </tbody>
                    </table>
                </div>
                : <p>Incorrect data format in file!</p>)
            }
        </>
    );
}