import React, { useEffect, useState } from 'react';

const TestData: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        fetch('http://localhost:8080/api')
            .then((response) => response.json())
            .then((data) => {
                setData(data);
                console.log(data);
            })
            .catch((error) => console.error('Error fetching data:', error));
    };

    return (
        <div>
            <h2>Data List:</h2>
            <ul>
                {data.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
            <button onClick={fetchData}>Fetch Data</button>
        </div>
    );
};

export default TestData;
