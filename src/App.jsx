import './App.css'
import NavBar from './assets/components/NavBar'
import LoadingState from './assets/components/LoadingState'
import { SettingsProvider } from './assets/contexts/settingsContext'

function App() {
  // useEffect(() => {
  //   getCoordinates("Boston").then((data) => {
  //     getForecast(data.latitude, data.longitude).then((forecast) => {console.log(forecast)})
  //   })
  // }, [])

  return (
    <>
      <SettingsProvider>
        <NavBar />
        <LoadingState/>
      </SettingsProvider>
      
    </>
  )
}

export default App
