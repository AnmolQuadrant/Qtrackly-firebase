import React from 'react'

function Button({onClick, children}) {
  return (
    <div>
        <button
            onClick = {onClick}
            className='inline-flex items-center justify-center px-3 py-2
             bg-[#8F00FF] text-white text-sm font-medium rounded-full 
             transition-colors duration-200 hover:bg-opacity-80'
        >
            {children}
        </button>
    </div>
  )
}

export default Button
