import React, { useRef,useState } from 'react'
import {LuUser,LuUpload,LuTrash} from 'react-icons/lu'
const ProfilePhotoSelector = ({ image, setImage }) => {
      const inputRef = useRef(null)
      const [previewUrl, setpreviewUrl] = useState(null)
      const   handelImageChange=(event)=>{
        const file = event.target.files[0]
        if(file){
          setImage(file)
          const preview= URL.createObjectURL(file)
          setpreviewUrl(preview)
        }
      }

      const handelRemoveImage=()=>{
        setImage(null)
        setpreviewUrl(null)
      }
      const onChoosefile =()=>{
        inputRef.current.click()
      }


  return (
    <div className='flex justify-center mb-6'>
        <input type="file" accept='image/*' ref={inputRef} onChange={handelImageChange} 
        className=' hidden'
        />
        {!image ? (
          <div className='w-20 h-20 flex items-center justify-center bg-blue-100/50 rounded-full relative cursor-pointer'>
            <LuUser className='text-4xl text-primary'/>
            <button className='w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer' onClick={onChoosefile}><LuUpload/></button>
          </div>
        ) : (
          <div className="relative">
            <img src={previewUrl} alt='profile Photo' className='h-20 w-20 rounded-full object-cover' />
            <button type='button' onClick={handelRemoveImage} className='w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer'><LuTrash/></button>
          </div>
        )}

    </div>
  )
}

export default ProfilePhotoSelector