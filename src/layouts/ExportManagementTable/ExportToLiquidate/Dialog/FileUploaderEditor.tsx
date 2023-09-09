import React, { useRef, Dispatch, SetStateAction } from "react";

import FileUploader from "devextreme-react/file-uploader";

import { ColumnEditCellTemplateData } from "devextreme/ui/data_grid";
import { ValueChangedEvent } from 'devextreme/ui/file_uploader';
import { useEvent } from "./utils";

type FileUploaderEditorProps = {
    cellInfo: ColumnEditCellTemplateData,
    setRetryButtonVisible: Dispatch<SetStateAction<boolean>>,
    retryButtonVisible: boolean
}

export const FileUploaderEditor = React.memo(({ cellInfo, setRetryButtonVisible, retryButtonVisible }: FileUploaderEditorProps) => {
    const fileUploaderRef = useRef<FileUploader>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const onValueChanged = useEvent((e: ValueChangedEvent) => {
        const reader = new FileReader();
        reader.onload = function (args) {
            if (typeof args.target?.result === 'string') {
                imgRef.current?.setAttribute('src', args.target.result);
                cellInfo.setValue(args.target.result);
            }
        }
        reader.readAsDataURL(e.value![0]); // convert to base64 string 

    });

    return (
        <>
            <img
                ref={imgRef}
                className="uploadedLinkFileRepairRenderImg"
                src={cellInfo.value}
                alt="LinkFileRepairRenderImg"
                width="300px"
                height="auto"
            />
            <FileUploader
                ref={fileUploaderRef}
                multiple={false}
                accept="image/*"
                uploadMode="useForm"
                onValueChanged={onValueChanged}
            />
        </>
    );
});