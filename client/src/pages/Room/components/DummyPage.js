import React from 'react'

export default function DummyPage() {
    return (
        <>
            <div className="padding-page room-page-info loading-page">
                <h2 className='load' > </h2>
                <span className='load' ></span>
                <p className='load' ></p>
            </div>
            <br />
            <div className="grids-page-container padding-page">
                <div className="cards-container">
                    {Array.from(Array(4).keys()).map(arr => <DummyParticipantCard key={arr} />)}
                </div>
            </div>
        </>
    )
}


function DummyParticipantCard() {
    return (
        <div className='participant-card loading-page'>
            <div className='load participant-emoji'></div>
            <div className="participant-info">
                <h4 className='load' > </h4>
                <p className='load' ></p>
            </div>
        </div>
    )
}