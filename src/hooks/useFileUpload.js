import { useEffect, useRef, useState } from 'react';

export default function useFileUpload() {
    const [file, setFile] = useState();
    const [fileAsText, setFileAsText] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        let fileReader, isCancel = false;
        if (file) {
            fileReader = new FileReader();
            fileReader.onload = (e) => {
                const { result } = e.target;
                if (result && !isCancel) {
                    setFileAsText(result)
                }
            }
            fileReader.readAsText(file);
        } else {
            setFileAsText(null);
        }
        return () => {
            isCancel = true;
            if (fileReader && fileReader.readyState === 1) {
                fileReader.abort();
            }
        }

    }, [file]);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const onCancel = () => {
        setFile(null);
    };

    const handleFileChange = (e) => {

        if (e.target.files) {
            const inputFile = e.target.files[0];

            const fileExtension = inputFile?.type.split("/")[1];
            if (fileExtension !== 'csv') {
                setError("Please input a csv file");
                return;
            }

            setError(null);
            setFile(inputFile);
            e.target.value = null;
        }
    };

    return [
        file,
        inputRef,
        handleClick,
        onCancel,
        handleFileChange,
        fileAsText,
        error
    ]
}