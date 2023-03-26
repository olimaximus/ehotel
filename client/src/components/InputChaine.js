import { Fragment, useState } from "react";

const InputChaine = () => {

    const [nom, setNom] = useState("")
    const [adresse, setAdresse] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")

    const onSubmitForm = async e => {
        e.preventDefault();
        try {
            const body = { nom, adresse, email, phone };
            const response = await fetch("http://localhost:5000/ehotel", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });

            window.location = "/";
            console.log(response)
        } catch (err) {
            console.error(err.message)
        }
    }


    return (
        <Fragment>
            <h1 className="text-center mt-5">Input Chaines</h1>
            <form className="d-flex mt-5" onSubmit={onSubmitForm}>
                <input type="text" className="form-control" placeholder="Nom de la chaine hotelière" value={nom} onChange={e => setNom(e.target.value)} />
                <input type="text" className="form-control" placeholder="Adresse de la chaine hotelière" value={adresse} onChange={e => setAdresse(e.target.value)} />
                <input type="text" className="form-control" placeholder="Email de la chaine hotelière" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="text" className="form-control" placeholder="Téléphone de la chaine hotelière" value={phone} onChange={e => setPhone(e.target.value)} />
                <button className="btn btn-success">Add</button>
            </form>
        </Fragment>
    );
}
 
export default InputChaine;