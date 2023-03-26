import { Fragment, useEffect, useState } from "react";

const FilterRooms = () => {

    const today = new Date().toISOString().split('T')[0];

    const [chambres, setChambres] = useState([]);

    const [capacity, setCapacity] = useState("1");
    const [hilton, setHilton] = useState("Hilton");
    const [sheraton, setSheraton] = useState("Sheraton");
    const [holidayinn, setHolidayInn] = useState("Holiday Inn");
    const [bestwestern, setBestWestern] = useState("Best Western");
    const [times, setTimes] = useState("Times");
    const [ville, setVille] = useState("all");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [minStars, setMinStars] = useState(1);
    const [maxStars, setMaxStars] = useState(5);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const [filtersApplied, setFiltersApplied] = useState(true);
    


    function handleFormSubmit(event) {
        event.preventDefault();
        setFiltersApplied(true)

        getChambre()
    }

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value)
        setFiltersApplied(false)
    }

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value)
        setFiltersApplied(false)
    }


      const handleReserveClick = () => {
        if(!filtersApplied) {
            alert("The dates have been changed. Please press the 'Filter' button before reserving a room")
        } else {
            alert("Room reserved")
        }
        
      }
      


      const getChambre = async() => {
        try {
          const params = new URLSearchParams();
          params.append('capacity', capacity);
          params.append('hilton', hilton);
          params.append('sheraton', sheraton);
          params.append('holidayinn', holidayinn);
          params.append('bestwestern', bestwestern);
          params.append('times', times);
          params.append('ville', ville);
          params.append('minPrice', minPrice);
          params.append('maxPrice', maxPrice);
          params.append('minStars', minStars);
          params.append('maxStars', maxStars);
          params.append('startDate', startDate);
          params.append('endDate', endDate);
      
          const response = await fetch(`http://localhost:5000/chambres?${params.toString()}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
          });
          const jsonData = await response.json();
      
          setChambres(jsonData);
        } catch (err) {
          console.error(err.message);
        }
      }
      

    useEffect(() => {
        getChambre();
    }, []);

    return ( 
        <Fragment>
            <h1 className="text-center mt-5">Choisir une chambre</h1>
            <form className="d-flex flex-column align-items-center mt-5" onSubmit={handleFormSubmit}>

                <div className="row mb-2">
                    <div className="col form-floating">
                        <input className="form-control" type="date" id="startdate" value={startDate} min={today} onChange={handleStartDateChange} required/>
                        <label htmlFor="startdate" className="mx-2"> Date début</label>
                    </div>
                    <div className="col form-floating">
                        <input className="form-control" type="date" id="enddate" value={endDate} min={startDate} onChange={handleEndDateChange} required/>
                        <label htmlFor="enddate" className="mx-2"> Date fin</label>
                    </div>
                </div>



                <div className="form-floating mb-2 w-25">
                    <select className="form-select" name="capacity" id="capacity" onChange={(event) => setCapacity(event.target.value)}>
                        <option value="1">1 personne</option>
                        <option value="2">2 personnes</option>
                        <option value="3">3 personnes</option>
                        <option value="4">4 personnes</option>
                        <option value="5">5 personnes</option>
                        <option value="6">6 personnes</option>
                        <option value="7">7 personnes</option>
                        <option value="8">8 personnes</option>
                    </select>
                    <label className="" htmlFor="capacity">Capacité minimale de la chambre:</label>
                </div>

                <div className="mb-1">
                    <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="Hilton" name="Hilton" value="Hilton" defaultChecked onChange={(event) => setHilton(event.target.checked ? "Hilton" : "")}/>
                        <label className="form-check-label" htmlFor="Hilton">Hilton</label>
                    </div>
                    <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="Sheraton" name="Sheraton" value="Sheraton" defaultChecked onChange={(event) => setSheraton(event.target.checked ? "Sheraton" : "")}/>
                        <label className="form-check-label" htmlFor="Sheraton">Sheraton</label>
                    </div>
                    <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="Holiday Inn" name="Holiday Inn" value="Holiday Inn" defaultChecked onChange={(event) => setHolidayInn(event.target.checked ? "Holiday Inn" : "")}/>
                        <label className="form-check-label" htmlFor="Holiday Inn">Holiday Inn</label>
                    </div>
                    <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="Best Western" name="Best Western" value="Best Western" defaultChecked onChange={(event) => setBestWestern(event.target.checked ? "Best Western" : "")}/>
                        <label className="form-check-label" htmlFor="Best Western">Best Western</label>
                    </div>
                    <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="Times" name="Times" value="Times" defaultChecked onChange={(event) => setTimes(event.target.checked ? "Times" : "")}/>
                        <label className="form-check-label" htmlFor="Times">Times</label>
                    </div>
                </div>

                
                <div className="form-floating mb-2 w-25">
                    <select className="form-select" name="ville" id="ville" onChange={(event) => setVille(event.target.value)}>
                        <option value="all"></option>
                        <option value="Gatineau">Gatineau</option>
                        <option value="Montréal">Montréal</option>
                        <option value="Québec">Québec</option>
                        <option value="Toronto">Toronto</option>
                    </select>
                    <label className="px-1" htmlFor="ville">Ville:</label>
                </div>

                <div className="row mb-2 w-50">
                    <div className="col-1"></div>
                    <div className="col-5">
                        <div className="form-floating">
                            <input className="form-control" id="PrixMin" type="number" defaultValue={0} min="0" onChange={(event) => setMinPrice(event.target.value)}/>
                            <label className="px-1" htmlFor="PrixMin">Prix minimal ($)</label>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="form-floating">
                            <input className="form-control" id="PrixMax" type="number" defaultValue={1000} min={minPrice} onChange={(event) => setMaxPrice(event.target.value)}/>
                            <label className="px-1" htmlFor="PrixMax">Prix maximal ($)</label>
                        </div>
                    </div>
                    <div className="col-1"></div>
                </div>

                <div className="row mb-2 w-50">
                    <div className="col-1"></div>
                    <div className="col-5">
                        <div className="form-floating">
                            <input className="form-control" id="ClassMin" type="number" defaultValue={1} min="1" max="5" onChange={(event) => setMinStars(event.target.value)}/>
                            <label className="px-1" htmlFor="ClassMin">Nombre minimum d'étoiles</label>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="form-floating">
                            <input className="form-control" id="ClassMax" type="number" defaultValue={5} min={minStars} max="5" onChange={(event) => setMaxStars(event.target.value)}/>
                            <label className="px-1" htmlFor="ClassMax">Nombre maximum d'étoiles</label>
                        </div>
                    </div>
                    <div className="col-1"></div>
                </div>

                <button className="btn btn-primary">Filtrer</button>
            </form>




            <table className="table mt-5 text-center">
                <thead>
                    <tr>
                        <th scope="col">Nom de l'hôtel</th>
                        <th scope="col">Ville</th>
                        <th scope="col">Adresse</th>
                        <th scope="col">Classification</th>
                        <th scope="col">Capacité</th>
                        <th scope="col">Prix</th>
                        <th scope="col">Réserver</th>
                    </tr>
                </thead>
                <tbody>
                    {chambres.map(chambre => (
                        <tr key={chambre.chambre_id}>
                            <td>{chambre.nom}</td>
                            <td>{chambre.ville}</td>
                            <td>{chambre.adresse}</td>
                            <td>{chambre.classification} étoiles</td>
                            <td>{chambre.capacity}</td>
                            <td>{chambre.prix}$</td>
                            <td>
                                <button className="btn btn-success" onClick={handleReserveClick}>Réserver</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Fragment>
     );
}
 
export default FilterRooms;