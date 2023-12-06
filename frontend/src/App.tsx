import { Progress } from "flowbite-react";
import axios from "./axios";
import DragAndDrop from "./components/DragAndDrop"
import { useEffect, useRef, useState } from "react";

function App() {
  const [progress, setProgress] = useState(0)
  const [disable, setDisable] = useState(false)
  const [result, setResult] = useState<string | undefined>(undefined)
  const [errMsg, setErrMsg] = useState("")
  let resultRef = useRef<HTMLDivElement>(null)

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
        })
        setResult(res.data)
      } catch (e: any) {
        setErrMsg("Sucesio un error inesperado")
      }
      setProgress(100)
    }
    setDisable(false)
  }

  useEffect(() => {
    setTimeout(() => {

      resultRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "end"
      })
    }, 100)
  }, [result])

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
          <div className="py-12" ref={resultRef}>
            <p className="text-lg text-center font-medium">Resultado</p>
            <img alt="resultado" src={result} width={256} height={256} />
          </div>
        }
      </div>
    </>
  )
}

export default App
