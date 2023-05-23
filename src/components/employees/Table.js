export default function Table({ elementClass, headers, content }) {
    return (
        <table className={elementClass}>
            <thead>
                <tr>
                    {headers.map(e => <th key={e}>{e}</th>)}
                </tr>
            </thead>
            <tbody>
                {content.map(e =>
                    <tr key={Object.values(e).join('')}>
                        {Object.values(e).map(x => <td key={x}>{x}</td>)}
                    </tr>)}
            </tbody>
        </table>
    );
}