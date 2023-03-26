import { Fragment, useEffect, useState } from "react";

const ListChaine = () => {

    const [chaines, setChaines] = useState([]);

    const getChaines = async() => {
        try {

            const response = await fetch("http://localhost:5000/ehotel")
            const jsonData = await response.json()

            setChaines(jsonData)
            
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getChaines();
    }, []);

    return ( 
        <Fragment>
            {" "}
            <table className="table mt-5 text-center">
                <thead>
                    <tr>
                        <th scope="col">Nom</th>
                        <th scope="col">Adresse</th>
                        <th scope="col">Email</th>
                        <th scope="col">Téléphone</th>
                    </tr>
                </thead>
                <tbody>
                    {/*
                    <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td>@mdo</td>
                    </tr> */}
                    {chaines.map(chaine => (
                        <tr>
                            <td>{chaine.nom}</td>
                            <td>{chaine.adresse}</td>
                            <td>{chaine.email}</td>
                            <td>{chaine.phone}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Fragment>
     );
}
 
export default ListChaine;