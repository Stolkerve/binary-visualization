import { Progress } from "flowbite-react";
import axios from "./axios";
import DragAndDrop from "./components/DragAndDrop"
import { useState } from "react";

function App() {
  const [progress, setProgress] = useState(0)
  const [disable, setDisable] = useState(false)
  const [result, setResult] = useState<string | undefined>(undefined)
  const [errMsg, setErrMsg] = useState("")

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const files = event.target.files
    if (files != null) {
      const file = files[0]
      if (file.size > 1024 * 1024 * 5) {
        setErrMsg("El tamano maximo es de 5mb")
        return
      }

      setProgress(0)
      setResult(undefined)
      setDisable(true)
      setErrMsg("")

      let formData = new FormData();
      formData.append("file", file);

      try {
        let res = await axios.post("/analize_img", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (event) => {
            setProgress((event.loaded / file.size) * 80)
          },
          onDownloadProgress: (event) => {
            setProgress(progress + event.progress! * 20)
          }
        })
        setResult(res.data)
      } catch (e: any) {
        setErrMsg("Sucesio un error inesperado")
      }
      if (progress < 100) {
        setProgress(100)
      }
    }
    setDisable(false)
  }

  return (
    <>
      <div className="flex flex-col items-center w-screen h-screen">
        <h1 className="text-3xl font-bold mt-[30vh] mb-10">Analisis visual de ficheros</h1>
        <div className="">
          <DragAndDrop onChange={handleUpload} disable={disable} />
          <Progress className="rounded-t-none border-dashed border-2 border-t-0 border-gray-600 h-3" progress={progress} />
          <p className="text-red-500 uppercase font-semibold">{errMsg}</p>
        </div>
        {
          result
          &&
          <div className="py-12">
            <p className="text-lg text-center font-medium">Resultado</p>
            <img alt="resultado" src={result} />
          </div>
        }
      </div>
    </>
  )
}

export default App
