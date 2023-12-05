import { FileInput, Label } from "flowbite-react";

export default function DragAndDrop({ onChange, disable }: { onChange: (event: React.ChangeEvent<HTMLInputElement>) => void, disable: boolean }) {
    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event)
    }

    return (
        <div className="flex w-full items-center justify-center hover:cursor-pointer">
            <Label
                htmlFor="dropzone-file"
                className=" relative flex h-auto w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-b-0 rounded-b-none border-dashed  border-gray-600 bg-gray-700 hover:border-gray-500"
            >
                <div className="flex flex-col items-center justify-center pb-6 pt-5 px-4">
                    <svg
                        className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click para subir fichero</span> o sueltalo
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Max 5mb</p>
                </div>
                <FileInput disabled={disable} id="dropzone-file" className="absolute top-0 left-0 w-full !h-full opacity-0 cursor-pointer" onChange={handleUpload} required />
            </Label>
        </div>
    )
}