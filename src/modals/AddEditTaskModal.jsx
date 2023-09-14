import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import crossIcon from '../assets/icon-cross.svg'
import { useSelector, useDispatch } from 'react-redux'
import  boardsSlice  from '../redux/boardsSlice';

function AddEditTaskModal({type, device , setOpenAddEditTask , setIsTaskModalOpen , taskIndex , prevColIndex = 0 , }) {

    const [isFirstLoad, setIsFirstLoad] = useState(true)
    const dispatch = useDispatch()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isValid, setIsValid] = useState(true)

    const board = useSelector((state) => state.boards).find((board) => board.isActive)
    
    const columns = board.columns
    const col = columns.find((col , index) => index === prevColIndex)

    const task = col ? col.tasks.find((task, index) => index === taskIndex) : [];

    const [status, setStatus] = useState(columns[prevColIndex].name)
    const [newColIndex, setNewColIndex] = useState(prevColIndex)
    const [subtasks, setSubtasks] = useState(
        [
            { title : "", isCompleted : false , id : uuidv4() },
            { title : "", isCompleted : false , id : uuidv4() },
        ]
    )

    if (type === 'edit' && isFirstLoad){
        setSubtasks(
            task.subtasks.map((subtask) => {
                return {...subtask , id: uuidv4()}
            })
        )
        setTitle(task.title)
        setDescription(task.description)
        setIsFirstLoad(false)
    }

    const onChange = (id, newValue) => {
        setSubtasks((prevState) => {
          const newState = [...prevState]
          const subtask = newState.find((subtask) => subtask.id === id)
          subtask.title = newValue
          return newState
        })
    }

    const onChangeStatus = (e) => {
        setStatus(e.target.value)
        setNewColIndex(e.target.selectedIndex)
    }

    const onDelete = (id) => {
        setSubtasks( (perState) => perState.filter((el) => el.id !== id))
    }

    const validate = () => {
        setIsValid(false)
        if(!title.trim()){
          return false
        }
        for ( let i = 0; i < subtasks.length; i++ ){
          if (!subtasks[i].title.trim()){
            return false
          }
        }
        setIsValid(true)
        return true 
      }


    const onSubmit = (type) => {
        if(type === 'add'){
            dispatch(boardsSlice.actions.addTask({
                title,
                status,
                description,
                subtasks,
                newColIndex
            }))
        } else {
            dispatch(
                boardsSlice.actions.editTask({
                    title,
                    description,
                    subtasks,
                    status,
                    taskIndex,
                    prevColIndex,
                    newColIndex
                })
            )
        }
    }

   return (
    <div 
    onClick={(e) => {
        if(e.target !== e.currentTarget){
            return
        }
        setOpenAddEditTask(false)
    }}
    className={device === 'mobile' ? 'py-6 px-6 pb-40 absolute overflow-scroll left-0 flex right-0 bottom-[-100vh] top-0 bg-[#00000080]' : 'py-6 px-6 pb-40 absolute overflow-scroll left-0 flex right-0 bottom-0 top-0 bg-[#00000080]'}>
        {/*Modal Section*/}

        <div className=' scrollbar-hide overflow-scroll max-h-[95vh] my-auto bg-white dark:bg-[#2b2c37] text-black dark:text-white font-bold shadow-md shadow-[#364e7e1a] max-w-md mx-auto w-full px-8 py-8 rounded-xl '>
            <h3 className='text-lg'>
                {type === 'edit' ? 'Edit' : 'Add New'} Task 
            </h3>

            {/*Task Name*/}
            <div className=' mt-8 flex flex-col space-y-1 '>
                <label className='text-sm dark:text-white text-gray-500 '>
                    Task Name 
                </label>
                <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className='bg-transparent px-4 py-2 outline-none focus:border-0 rounded-md text-sm border border-gray-600 focus:outline-[#635fc7] ring-0 '
                type="text"
                placeholder='Task Name'
                id="task-name-input"/>
            </div>

            {/*Description*/}
            <div className=' mt-8 flex flex-col space-y-1 '>
                <label className='text-sm dark:text-white text-gray-500 '>
                    Description 
                </label>
                <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className='bg-transparent px-4 py-2 outline-none focus:border-0 min-h-[200px] rounded-md text-sm border border-gray-600 focus:outline-[#635fc7] ring-0 '
                placeholder= "Remember not to try to save with empty fields in the subtask. If you don't have any subtasks, delete all fields, otherwise you won't be able to create a task"/>
            </div>

            {/*Subtask Section*/}
            <div className=' mt-8 flex flex-col space-y-1 '>
                <label className='text-sm dark:text-white text-gray-500 '>
                    Subtasks  
                </label>
                {
                    subtasks.map((subtask, index) => (
                        <div key={index}
                        className='flex items-center w-full'>
                            <input 
                            onChange={(e) => {
                                onChange(subtask.id , e.target.value)
                            }}
                            type="text"
                            value={subtask.title} 
                            className='bg-transparent outline-none focus:border-0 border flex-grow px-4 py-2 rounded-md text-sm border-gray-600 focus:outline-[#635fc7]'
                            placeholder='Subtasks'/>
                            <img onClick={() => {
                                onDelete(subtask.id)
                            }}
                            src={crossIcon} className='m-4 cursor-pointer' />

                        </div>
                    ))
                }
                <button onClick={() => {
                    setSubtasks((state) => [
                        ...state,
                        { title : "", isCompleted : false , id : uuidv4() },
                    ])
                }}
                className='w-full items-center dark:text-[#635fc7] dark:bg-white text-white bg-[#635fc7] py-2 rounded-full'>
                    + Add New Subtask 

                </button>
            </div>  

            {/*Current Status Section*/}    
            <div className="mt-8 flex flex-col space-y-3">
                <label className="text-sm dark:text-white text-gray-500">
                    Current Status
                </label>
                <select 
                value={status}
                onChange={onChangeStatus}
                className="select-status flex flex-grow px-4 py-2 rounded-md text-sm bg-transparent focus:border-0  border border-gray-300 focus:outline-[#635fc7] outline-none">
                    { columns.map((column , index) => (
                        <option value={column.name}
                        key={index}>
                        {column.name}
                        </option>
                     ))}
                </select>

                <button onClick={() => {
                    const isValid = validate()
                    if(isValid){
                        onSubmit(type)
                        setOpenAddEditTask(false)
                        type === "edit" && setIsTaskModalOpen(false)
                    }
                }}
                className=' w-full items-center text-white bg-[#635fc7] py-2 rounded-full '>
                    { type === "edit" ? 'Save Edit' : 'Create Task' }
                </button>
            </div>   
        </div>
    </div>
  )
}

export default AddEditTaskModal